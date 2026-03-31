import type { PriceSource } from '../domain/enums'
import type { PriceTick } from '../domain/types'

export interface MarketDataProvider {
  fetchPrice(symbol: string): Promise<PriceTick | null>
}

export class MarketDataService {
  private cache = new Map<string, PriceTick>()
  private provider?: MarketDataProvider

  constructor(provider?: MarketDataProvider) {
    this.provider = provider
  }

  async getPrice(symbol: string): Promise<PriceTick | null> {
    const cached = this.cache.get(symbol)
    if (cached) return cached

    if (!this.provider) return null
    const fetched = await this.provider.fetchPrice(symbol)
    if (fetched) this.cache.set(symbol, fetched)
    return fetched
  }

  setManualPrice(symbol: string, value: number): PriceTick {
    const tick: PriceTick = {
      symbol,
      value,
      source: 'MANUAL',
      updatedAt: new Date().toISOString(),
    }
    this.cache.set(symbol, tick)
    return tick
  }

  upsertPrice(symbol: string, value: number, source: PriceSource): PriceTick {
    const tick: PriceTick = {
      symbol,
      value,
      source,
      updatedAt: new Date().toISOString(),
    }
    this.cache.set(symbol, tick)
    return tick
  }

  getCachedPrices(): Record<string, PriceTick> {
    return Object.fromEntries(this.cache.entries())
  }
}
