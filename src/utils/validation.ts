import { SEGMENTS, TRANSACTION_TYPES, PRODUCT_TYPES } from '../domain/enums'
import type { Trade } from '../domain/types'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const validateTradeInput = (
  input: Partial<Trade>,
  instrumentExists: boolean,
  isSubmitting: boolean,
): ValidationResult => {
  const errors: Record<string, string> = {}

  if (isSubmitting) {
    errors.form = 'Trade is already being submitted. Please wait.'
  }

  if (!input.symbol?.trim()) errors.symbol = 'Symbol is required.'
  if (!input.segment || !SEGMENTS.includes(input.segment)) {
    errors.segment = 'Segment is required.'
  }
  if (!input.tradeDateTime?.trim()) errors.tradeDateTime = 'Trade date/time is required.'
  if (!instrumentExists) errors.instrumentId = 'Selected instrument does not exist.'

  if (!input.transactionType || !TRANSACTION_TYPES.includes(input.transactionType)) {
    errors.transactionType = 'Transaction type must be BUY or SELL.'
  }
  if (!input.productType || !PRODUCT_TYPES.includes(input.productType)) {
    errors.productType = 'Product type is invalid.'
  }

  const quantity = parseNumber(input.quantity)
  if (quantity === null || quantity <= 0) errors.quantity = 'Quantity must be greater than 0.'

  const price = parseNumber(input.price)
  if (price === null || price < 0) errors.price = 'Price must be a valid non-negative number.'

  const fee = parseNumber(input.fee)
  if (fee === null || fee < 0) errors.fee = 'Fee must be a valid non-negative number.'

  if (input.segment === 'FUTURES' || input.segment === 'OPTIONS') {
    const lots = parseNumber(input.lots)
    const lotSize = parseNumber(input.lotSize)
    if (lots === null || lots <= 0) errors.lots = 'Lots must be greater than 0 for derivatives.'
    if (lotSize === null || lotSize <= 0) {
      errors.lotSize = 'Lot size must be greater than 0 for derivatives.'
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

export const deriveQuantity = (segment: Trade['segment'], quantity: number, lots?: number, lotSize?: number): number => {
  if (segment === 'FUTURES' || segment === 'OPTIONS') {
    if (!lots || !lotSize) return quantity
    return lots * lotSize
  }
  return quantity
}
