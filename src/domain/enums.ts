export const SEGMENTS = ['EQUITY', 'FUTURES', 'OPTIONS'] as const
export const TRANSACTION_TYPES = ['BUY', 'SELL'] as const
export const PRODUCT_TYPES = ['CNC', 'MIS', 'NRML', 'POSITIONAL'] as const
export const OPTION_TYPES = ['CE', 'PE'] as const
export const ROLE_TYPES = ['admin', 'advisor', 'client'] as const
export const COST_BASIS_METHODS = ['FIFO', 'AVERAGE_COST'] as const
export const PRICE_SOURCES = ['API', 'MANUAL'] as const

export type Segment = (typeof SEGMENTS)[number]
export type TransactionType = (typeof TRANSACTION_TYPES)[number]
export type ProductType = (typeof PRODUCT_TYPES)[number]
export type OptionType = (typeof OPTION_TYPES)[number]
export type RoleType = (typeof ROLE_TYPES)[number]
export type CostBasisMethod = (typeof COST_BASIS_METHODS)[number]
export type PriceSource = (typeof PRICE_SOURCES)[number]
