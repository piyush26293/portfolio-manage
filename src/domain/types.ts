import type {
  CostBasisMethod,
  OptionType,
  PriceSource,
  ProductType,
  RoleType,
  Segment,
  TransactionType,
} from './enums'

export interface UserProfile {
  id: string
  email: string
  role: RoleType
  assignedClientIds?: string[]
  linkedClientId?: string
}

export interface Client {
  id: string
  name: string
  advisorId?: string
  enabledClientPortal?: boolean
  createdAt: string
}

export interface Portfolio {
  id: string
  clientId: string
  name: string
  costBasisMethod: CostBasisMethod
  createdAt: string
}

export interface Instrument {
  id: string
  clientId: string
  portfolioId: string
  name: string
  symbol: string
  exchange: string
  segment: Segment
  lotSize?: number
  strikePrice?: number
  expiryDate?: string
  optionType?: OptionType
}

export interface Trade {
  id: string
  clientId: string
  portfolioId: string
  instrumentId: string
  instrumentName: string
  symbol: string
  exchange: string
  segment: Segment
  transactionType: TransactionType
  productType: ProductType
  quantity: number
  lots?: number
  lotSize?: number
  price: number
  fee: number
  strikePrice?: number
  expiryDate?: string
  optionType?: OptionType
  tradeDateTime: string
  notes?: string
}

export interface PriceTick {
  symbol: string
  value: number
  source: PriceSource
  updatedAt: string
}

export interface Snapshot {
  id: string
  clientId: string
  portfolioId: string
  createdAt: string
  totalValue: number
  totalRealizedPnL: number
  totalUnrealizedPnL: number
}

export interface PositionSummary {
  instrumentId: string
  symbol: string
  segment: Segment
  quantity: number
  averageCost: number
  currentPrice: number
  realizedPnL: number
  unrealizedPnL: number
  totalFees: number
  isOpen: boolean
}

export interface PortfolioComputation {
  positions: PositionSummary[]
  totalRealizedPnL: number
  totalUnrealizedPnL: number
  totalFees: number
}
