import { describe, expect, it } from 'vitest'
import { computePortfolio } from './calculationEngine'
import type { Segment, TransactionType } from '../enums'
import type { Trade } from '../types'

const baseTrade = (
  id: string,
  segment: Segment,
  type: TransactionType,
  quantity: number,
  price: number,
  fee = 0,
  at = '2026-01-01T10:00:00.000Z',
  instrumentId = `${segment}-inst`,
  symbol = `${segment}SYM`,
): Trade => ({
  id,
  clientId: 'c1',
  portfolioId: 'p1',
  instrumentId,
  instrumentName: instrumentId,
  symbol,
  exchange: 'NSE',
  segment,
  transactionType: type,
  productType: 'NRML',
  quantity,
  price,
  fee,
  tradeDateTime: at,
})

describe('computePortfolio', () => {
  it('handles empty trade list', () => {
    const result = computePortfolio({ trades: [] })
    expect(result.positions).toEqual([])
    expect(result.totalRealizedPnL).toBe(0)
    expect(result.totalUnrealizedPnL).toBe(0)
  })

  it('equity single buy', () => {
    const result = computePortfolio({
      trades: [baseTrade('1', 'EQUITY', 'BUY', 10, 100)],
      currentPrices: { EQUITYSYM: { value: 110, source: 'MANUAL', updatedAt: 't' } },
    })

    expect(result.positions[0]).toMatchObject({
      quantity: 10,
      averageCost: 100,
      unrealizedPnL: 100,
      realizedPnL: 0,
    })
  })

  it('equity multiple buys and average cost', () => {
    const result = computePortfolio({
      trades: [
        baseTrade('1', 'EQUITY', 'BUY', 10, 100),
        baseTrade('2', 'EQUITY', 'BUY', 10, 120, 0, '2026-01-01T11:00:00.000Z'),
      ],
      costBasisMethod: 'AVERAGE_COST',
      currentPrices: { EQUITYSYM: { value: 115, source: 'MANUAL', updatedAt: 't' } },
    })

    expect(result.positions[0].averageCost).toBe(110)
    expect(result.positions[0].unrealizedPnL).toBe(100)
  })

  it('partial sell realizes P/L', () => {
    const result = computePortfolio({
      trades: [
        baseTrade('1', 'EQUITY', 'BUY', 10, 100),
        baseTrade('2', 'EQUITY', 'SELL', 4, 130, 10, '2026-01-01T11:00:00.000Z'),
      ],
    })

    expect(result.positions[0].quantity).toBe(6)
    expect(result.positions[0].realizedPnL).toBe(110)
  })

  it('full sell closes position', () => {
    const result = computePortfolio({
      trades: [
        baseTrade('1', 'EQUITY', 'BUY', 5, 100),
        baseTrade('2', 'EQUITY', 'SELL', 5, 110, 5, '2026-01-01T11:00:00.000Z'),
      ],
    })

    expect(result.positions[0].quantity).toBe(0)
    expect(result.positions[0].isOpen).toBe(false)
    expect(result.positions[0].realizedPnL).toBe(45)
  })

  it('FIFO lot consumption', () => {
    const result = computePortfolio({
      trades: [
        baseTrade('1', 'EQUITY', 'BUY', 10, 100),
        baseTrade('2', 'EQUITY', 'BUY', 10, 120, 0, '2026-01-01T11:00:00.000Z'),
        baseTrade('3', 'EQUITY', 'SELL', 15, 130, 0, '2026-01-01T12:00:00.000Z'),
      ],
      costBasisMethod: 'FIFO',
    })

    expect(result.positions[0].realizedPnL).toBe(350)
    expect(result.positions[0].quantity).toBe(5)
    expect(result.positions[0].averageCost).toBe(120)
  })

  it('buy fees increase cost basis and sell fees reduce profits', () => {
    const result = computePortfolio({
      trades: [
        baseTrade('1', 'EQUITY', 'BUY', 10, 100, 20),
        baseTrade('2', 'EQUITY', 'SELL', 5, 120, 10, '2026-01-01T11:00:00.000Z'),
      ],
    })

    expect(result.positions[0].averageCost).toBe(102)
    expect(result.positions[0].realizedPnL).toBeCloseTo(80)
  })

  it('futures long unrealized P/L', () => {
    const result = computePortfolio({
      trades: [baseTrade('1', 'FUTURES', 'BUY', 50, 200)],
      currentPrices: { FUTURESSYM: { value: 230, source: 'API', updatedAt: 't' } },
    })

    expect(result.positions[0].unrealizedPnL).toBe(1500)
  })

  it('futures short unrealized P/L', () => {
    const result = computePortfolio({
      trades: [baseTrade('1', 'FUTURES', 'SELL', 50, 230, 0)],
      currentPrices: { FUTURESSYM: { value: 200, source: 'API', updatedAt: 't' } },
      allowShortBySegment: { FUTURES: true },
    })

    expect(result.positions[0].quantity).toBe(50)
    expect(result.positions[0].unrealizedPnL).toBe(1500)
  })

  it('options long and short premium based P/L', () => {
    const long = computePortfolio({
      trades: [baseTrade('1', 'OPTIONS', 'BUY', 100, 10)],
      currentPrices: { OPTIONSSYM: { value: 14, source: 'MANUAL', updatedAt: 't' } },
    })

    const short = computePortfolio({
      trades: [baseTrade('2', 'OPTIONS', 'SELL', 100, 14, 0, '2026-01-01T10:00:00.000Z')],
      currentPrices: { OPTIONSSYM: { value: 10, source: 'MANUAL', updatedAt: 't' } },
      allowShortBySegment: { OPTIONS: true },
    })

    expect(long.positions[0].unrealizedPnL).toBe(400)
    expect(short.positions[0].unrealizedPnL).toBe(400)
  })

  it('throws on invalid sell beyond holdings when shorts disabled', () => {
    expect(() =>
      computePortfolio({
        trades: [
          baseTrade('1', 'EQUITY', 'BUY', 5, 100),
          baseTrade('2', 'EQUITY', 'SELL', 10, 105, 0, '2026-01-01T11:00:00.000Z'),
        ],
      }),
    ).toThrow(/Invalid sell beyond holdings/)
  })

  it('uses average cost fallback if current price missing', () => {
    const result = computePortfolio({
      trades: [baseTrade('1', 'EQUITY', 'BUY', 5, 100)],
    })

    expect(result.positions[0].currentPrice).toBe(100)
    expect(result.positions[0].unrealizedPnL).toBe(0)
  })

  it('mixed portfolio with equity futures options', () => {
    const trades = [
      baseTrade('1', 'EQUITY', 'BUY', 10, 100, 0, '2026-01-01T10:00:00.000Z', 'eq', 'EQ'),
      baseTrade('2', 'FUTURES', 'BUY', 50, 200, 0, '2026-01-01T10:01:00.000Z', 'fu', 'FU'),
      baseTrade('3', 'OPTIONS', 'SELL', 100, 12, 0, '2026-01-01T10:02:00.000Z', 'op', 'OP'),
    ]

    const result = computePortfolio({
      trades,
      currentPrices: {
        EQ: { value: 110, source: 'API', updatedAt: 't' },
        FU: { value: 210, source: 'API', updatedAt: 't' },
        OP: { value: 8, source: 'MANUAL', updatedAt: 't' },
      },
      allowShortBySegment: { FUTURES: true, OPTIONS: true },
    })

    expect(result.positions).toHaveLength(3)
    expect(result.totalUnrealizedPnL).toBe(1000)
  })


  it('average cost sell consumption updates realized P/L', () => {
    const result = computePortfolio({
      trades: [
        baseTrade('1', 'EQUITY', 'BUY', 10, 100),
        baseTrade('2', 'EQUITY', 'BUY', 10, 120, 0, '2026-01-01T11:00:00.000Z'),
        baseTrade('3', 'EQUITY', 'SELL', 5, 130, 0, '2026-01-01T12:00:00.000Z'),
      ],
      costBasisMethod: 'AVERAGE_COST',
    })

    expect(result.positions[0].quantity).toBe(15)
    expect(result.positions[0].realizedPnL).toBe(100)
    expect(result.positions[0].averageCost).toBe(110)
  })

  it('buy can close an existing short position and realize P/L', () => {
    const result = computePortfolio({
      trades: [
        baseTrade('1', 'OPTIONS', 'SELL', 100, 20),
        baseTrade('2', 'OPTIONS', 'BUY', 40, 12, 0, '2026-01-01T11:00:00.000Z'),
      ],
      allowShortBySegment: { OPTIONS: true },
    })

    expect(result.positions[0].quantity).toBe(60)
    expect(result.positions[0].realizedPnL).toBe(320)
    expect(result.positions[0].isOpen).toBe(true)
  })

  it('zero holdings after closing trade', () => {
    const result = computePortfolio({
      trades: [
        baseTrade('1', 'EQUITY', 'BUY', 5, 100),
        baseTrade('2', 'EQUITY', 'SELL', 5, 100, 0, '2026-01-01T11:00:00.000Z'),
      ],
    })

    expect(result.positions[0].quantity).toBe(0)
    expect(result.positions[0].unrealizedPnL).toBe(0)
  })
})
