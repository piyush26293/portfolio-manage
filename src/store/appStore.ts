import { create } from 'zustand'
import { computePortfolio } from '../domain/pl/calculationEngine'
import type { Client, Instrument, Portfolio, PriceTick, Trade } from '../domain/types'
import { firestoreRepository } from '../repositories/firestoreRepository'
import { MarketDataService } from '../services/marketDataService'
import { validateTradeInput } from '../utils/validation'

interface AppState {
  clients: Client[]
  portfolios: Portfolio[]
  instruments: Instrument[]
  trades: Trade[]
  prices: Record<string, PriceTick>
  loading: boolean
  error?: string
  selectedClientId?: string
  selectedPortfolioId?: string
  marketDataService: MarketDataService
  loadClients: () => Promise<void>
  selectClient: (clientId: string) => Promise<void>
  selectPortfolio: (portfolioId: string) => Promise<void>
  addTrade: (trade: Omit<Trade, 'id'>) => Promise<void>
  setManualPrice: (symbol: string, value: number) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  portfolios: [],
  instruments: [],
  trades: [],
  prices: {},
  loading: false,
  marketDataService: new MarketDataService(),

  loadClients: async () => {
    set({ loading: true, error: undefined })
    try {
      const clients = await firestoreRepository.listClients()
      set({ clients, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  selectClient: async (clientId: string) => {
    set({ loading: true, selectedClientId: clientId, error: undefined })
    try {
      const portfolios = await firestoreRepository.listPortfolios(clientId)
      set({ portfolios, selectedPortfolioId: portfolios[0]?.id, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  selectPortfolio: async (portfolioId: string) => {
    const { selectedClientId } = get()
    if (!selectedClientId) return
    set({ loading: true, selectedPortfolioId: portfolioId, error: undefined })
    try {
      const [instruments, trades] = await Promise.all([
        firestoreRepository.listInstruments(selectedClientId, portfolioId),
        firestoreRepository.listTrades(selectedClientId, portfolioId),
      ])
      set({ instruments, trades, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addTrade: async (tradeInput: Omit<Trade, 'id'>) => {
    const state = get()
    const instrumentExists = state.instruments.some((x) => x.id === tradeInput.instrumentId)
    const validation = validateTradeInput(tradeInput, instrumentExists, state.loading)

    if (!validation.isValid) {
      set({ error: Object.values(validation.errors)[0] })
      return
    }

    set({ loading: true, error: undefined })
    try {
      const tradeId = await firestoreRepository.createTrade(tradeInput.clientId, tradeInput.portfolioId, tradeInput)
      set((prev) => ({
        trades: [...prev.trades, { ...tradeInput, id: tradeId }],
        loading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  setManualPrice: (symbol: string, value: number) => {
    const tick = get().marketDataService.setManualPrice(symbol, value)
    set((prev) => ({ prices: { ...prev.prices, [symbol]: tick } }))
  },
}))

export const selectPortfolioComputation = (state: AppState) =>
  computePortfolio({
    trades: state.trades,
    currentPrices: Object.fromEntries(
      Object.entries(state.prices).map(([symbol, tick]) => [symbol, tick]),
    ),
  })
