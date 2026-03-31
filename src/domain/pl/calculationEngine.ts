import type { CostBasisMethod, PriceSource, Segment } from '../enums'
import type { PortfolioComputation, Trade } from '../types'

export interface PriceMapEntry {
  value: number
  source: PriceSource
  updatedAt: string
}

type Lot = { qty: number; unitPrice: number }

type PositionAccumulator = {
  instrumentId: string
  symbol: string
  segment: Segment
  longLots: Lot[]
  shortLots: Lot[]
  realizedPnL: number
  totalFees: number
}

export interface ComputePortfolioInput {
  trades: Trade[]
  currentPrices?: Record<string, PriceMapEntry | undefined>
  costBasisMethod?: CostBasisMethod
  allowShortBySegment?: Partial<Record<Segment, boolean>>
}

const sortTrades = (trades: Trade[]): Trade[] =>
  [...trades].sort((a, b) => new Date(a.tradeDateTime).getTime() - new Date(b.tradeDateTime).getTime())

const totalQty = (lots: Lot[]): number => lots.reduce((sum, lot) => sum + lot.qty, 0)

const averagePrice = (lots: Lot[]): number => {
  const qty = totalQty(lots)
  if (!qty) return 0
  return lots.reduce((sum, lot) => sum + lot.qty * lot.unitPrice, 0) / qty
}

const ensurePosition = (map: Map<string, PositionAccumulator>, trade: Trade): PositionAccumulator => {
  const existing = map.get(trade.instrumentId)
  if (existing) return existing

  const created: PositionAccumulator = {
    instrumentId: trade.instrumentId,
    symbol: trade.symbol,
    segment: trade.segment,
    longLots: [],
    shortLots: [],
    realizedPnL: 0,
    totalFees: 0,
  }
  map.set(trade.instrumentId, created)
  return created
}

const consumeLots = (
  lots: Lot[],
  quantity: number,
  costBasisMethod: CostBasisMethod,
): { totalValue: number } => {
  if (costBasisMethod === 'AVERAGE_COST') {
    const avg = averagePrice(lots)
    let remaining = quantity
    while (remaining > 0) {
      const lot = lots[0]
      if (!lot) throw new Error('Insufficient quantity for lot consumption')
      const consumed = Math.min(lot.qty, remaining)
      lot.qty -= consumed
      remaining -= consumed
      if (!lot.qty) lots.shift()
    }
    return { totalValue: avg * quantity }
  }

  let remaining = quantity
  let totalValue = 0
  while (remaining > 0) {
    const lot = lots[0]
    if (!lot) throw new Error('Insufficient quantity for lot consumption')
    const consumed = Math.min(lot.qty, remaining)
    totalValue += consumed * lot.unitPrice
    lot.qty -= consumed
    remaining -= consumed
    if (!lot.qty) lots.shift()
  }

  return { totalValue }
}

const applyBuy = (position: PositionAccumulator, trade: Trade, costBasisMethod: CostBasisMethod): void => {
  position.totalFees += trade.fee
  let remainingQty = trade.quantity

  const openShortQty = totalQty(position.shortLots)
  if (openShortQty > 0) {
    const closeQty = Math.min(openShortQty, remainingQty)
    const feeAllocated = (trade.fee * closeQty) / trade.quantity
    const shortValue = consumeLots(position.shortLots, closeQty, costBasisMethod).totalValue
    const buyValue = trade.price * closeQty + feeAllocated
    position.realizedPnL += shortValue - buyValue
    remainingQty -= closeQty
  }

  if (remainingQty > 0) {
    const feeAllocated = (trade.fee * remainingQty) / trade.quantity
    const unitCost = (trade.price * remainingQty + feeAllocated) / remainingQty
    position.longLots.push({ qty: remainingQty, unitPrice: unitCost })
  }
}

const applySell = (
  position: PositionAccumulator,
  trade: Trade,
  costBasisMethod: CostBasisMethod,
  allowShort: boolean,
): void => {
  position.totalFees += trade.fee
  let remainingQty = trade.quantity

  const openLongQty = totalQty(position.longLots)
  if (openLongQty > 0) {
    const closeQty = Math.min(openLongQty, remainingQty)
    const feeAllocated = (trade.fee * closeQty) / trade.quantity
    const costValue = consumeLots(position.longLots, closeQty, costBasisMethod).totalValue
    const sellValue = trade.price * closeQty - feeAllocated
    position.realizedPnL += sellValue - costValue
    remainingQty -= closeQty
  }

  if (remainingQty > 0) {
    if (!allowShort) {
      throw new Error(`Invalid sell beyond holdings for ${position.symbol}`)
    }
    const feeAllocated = (trade.fee * remainingQty) / trade.quantity
    const unitEntry = (trade.price * remainingQty - feeAllocated) / remainingQty
    position.shortLots.push({ qty: remainingQty, unitPrice: unitEntry })
  }
}

export const computePortfolio = ({
  trades,
  currentPrices = {},
  costBasisMethod = 'FIFO',
  allowShortBySegment = { FUTURES: true, OPTIONS: true, EQUITY: false },
}: ComputePortfolioInput): PortfolioComputation => {
  if (trades.length === 0) {
    return {
      positions: [],
      totalRealizedPnL: 0,
      totalUnrealizedPnL: 0,
      totalFees: 0,
    }
  }

  const map = new Map<string, PositionAccumulator>()
  for (const trade of sortTrades(trades)) {
    const position = ensurePosition(map, trade)
    if (trade.transactionType === 'BUY') {
      applyBuy(position, trade, costBasisMethod)
      continue
    }

    const allowShort = allowShortBySegment[trade.segment] ?? false
    applySell(position, trade, costBasisMethod, allowShort)
  }

  const positions = Array.from(map.values()).map((position) => {
    const longQty = totalQty(position.longLots)
    const shortQty = totalQty(position.shortLots)
    const isShort = shortQty > 0
    const quantity = isShort ? shortQty : longQty
    const averageCost = isShort ? averagePrice(position.shortLots) : averagePrice(position.longLots)
    const currentPrice = currentPrices[position.symbol]?.value ?? averageCost

    const unrealizedPnL = isShort
      ? (averageCost - currentPrice) * shortQty
      : (currentPrice - averageCost) * longQty

    return {
      instrumentId: position.instrumentId,
      symbol: position.symbol,
      segment: position.segment,
      quantity,
      averageCost,
      currentPrice,
      realizedPnL: position.realizedPnL,
      unrealizedPnL,
      totalFees: position.totalFees,
      isOpen: quantity > 0,
    }
  })

  return {
    positions,
    totalRealizedPnL: positions.reduce((sum, p) => sum + p.realizedPnL, 0),
    totalUnrealizedPnL: positions.reduce((sum, p) => sum + p.unrealizedPnL, 0),
    totalFees: positions.reduce((sum, p) => sum + p.totalFees, 0),
  }
}
