import type { Client, Instrument, Portfolio, Trade } from '../domain/types'

export const seedClients: Client[] = [
  { id: 'client-1', name: 'Aarav Capital', advisorId: 'advisor-1', enabledClientPortal: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'client-2', name: 'Isha Wealth', advisorId: 'advisor-1', enabledClientPortal: false, createdAt: '2026-01-02T00:00:00.000Z' },
]

export const seedPortfolios: Portfolio[] = [
  { id: 'portfolio-1', clientId: 'client-1', name: 'Core Growth', costBasisMethod: 'FIFO', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'portfolio-2', clientId: 'client-2', name: 'Derivatives Desk', costBasisMethod: 'AVERAGE_COST', createdAt: '2026-01-02T00:00:00.000Z' },
]

export const seedInstruments: Instrument[] = [
  { id: 'inst-eq-1', clientId: 'client-1', portfolioId: 'portfolio-1', name: 'Infosys Ltd', symbol: 'INFY', exchange: 'NSE', segment: 'EQUITY' },
  { id: 'inst-fut-1', clientId: 'client-1', portfolioId: 'portfolio-1', name: 'NIFTY APR FUT', symbol: 'NIFTYFUT', exchange: 'NSE', segment: 'FUTURES', lotSize: 50 },
  { id: 'inst-opt-1', clientId: 'client-1', portfolioId: 'portfolio-1', name: 'BANKNIFTY 45000 CE', symbol: 'BANKNIFTYCE', exchange: 'NSE', segment: 'OPTIONS', lotSize: 15, strikePrice: 45000, expiryDate: '2026-04-30', optionType: 'CE' },
]

export const seedTrades: Trade[] = [
  {
    id: 'trade-1',
    clientId: 'client-1',
    portfolioId: 'portfolio-1',
    instrumentId: 'inst-eq-1',
    instrumentName: 'Infosys Ltd',
    symbol: 'INFY',
    exchange: 'NSE',
    segment: 'EQUITY',
    transactionType: 'BUY',
    productType: 'CNC',
    quantity: 100,
    price: 1500,
    fee: 25,
    tradeDateTime: '2026-03-01T10:00:00.000Z',
    notes: 'Long term buy',
  },
  {
    id: 'trade-2',
    clientId: 'client-1',
    portfolioId: 'portfolio-1',
    instrumentId: 'inst-fut-1',
    instrumentName: 'NIFTY APR FUT',
    symbol: 'NIFTYFUT',
    exchange: 'NSE',
    segment: 'FUTURES',
    transactionType: 'BUY',
    productType: 'NRML',
    quantity: 50,
    lots: 1,
    lotSize: 50,
    price: 22600,
    fee: 30,
    tradeDateTime: '2026-03-15T11:00:00.000Z',
  },
  {
    id: 'trade-3',
    clientId: 'client-1',
    portfolioId: 'portfolio-1',
    instrumentId: 'inst-opt-1',
    instrumentName: 'BANKNIFTY 45000 CE',
    symbol: 'BANKNIFTYCE',
    exchange: 'NSE',
    segment: 'OPTIONS',
    transactionType: 'SELL',
    productType: 'NRML',
    quantity: 15,
    lots: 1,
    lotSize: 15,
    price: 210,
    fee: 10,
    strikePrice: 45000,
    expiryDate: '2026-04-30',
    optionType: 'CE',
    tradeDateTime: '2026-03-20T09:45:00.000Z',
  },
]
