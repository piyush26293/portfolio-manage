import { useEffect, useMemo, useState } from 'react'
import { ClosedPositionsTable } from '../components/dashboard/ClosedPositionsTable'
import { ManualPriceEditor } from '../components/dashboard/ManualPriceEditor'
import { OpenPositionsTable } from '../components/dashboard/OpenPositionsTable'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { TradeEntryForm } from '../components/dashboard/TradeEntryForm'
import { TradeHistoryTable } from '../components/dashboard/TradeHistoryTable'
import { computePortfolio } from '../domain/pl/calculationEngine'
import { useAppStore } from '../store/appStore'

export const PortfolioDashboardPage = () => {
  const {
    clients,
    portfolios,
    instruments,
    trades,
    loading,
    error,
    selectedClientId,
    selectedPortfolioId,
    loadClients,
    selectClient,
    selectPortfolio,
    addTrade,
    setManualPrice,
  } = useAppStore()

  const [segmentFilter, setSegmentFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('')

  const prices = useAppStore((state) => state.prices)
  const computation = useMemo(
    () =>
      computePortfolio({
        trades,
        currentPrices: prices,
      }),
    [trades, prices],
  )

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  useEffect(() => {
    if (!selectedClientId && clients[0]) {
      void selectClient(clients[0].id)
    }
  }, [clients, selectedClientId, selectClient])

  useEffect(() => {
    if (!selectedPortfolioId && portfolios[0]) {
      void selectPortfolio(portfolios[0].id)
    }
  }, [portfolios, selectedPortfolioId, selectPortfolio])

  const filteredTrades = useMemo(
    () =>
      trades.filter((trade) => {
        const segmentOk = segmentFilter === 'ALL' || trade.segment === segmentFilter
        const dateOk = !dateFilter || trade.tradeDateTime.slice(0, 10) === dateFilter
        return segmentOk && dateOk
      }),
    [trades, segmentFilter, dateFilter],
  )

  const openPositions = computation.positions.filter((position) => position.isOpen)
  const closedPositions = computation.positions.filter((position) => !position.isOpen)

  if (loading && !clients.length) {
    return <div className="p-4 text-slate-500">Loading portfolio data...</div>
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4">
      <header className="rounded border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-800">Indian Portfolio Management Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manual trade entry system for equity, futures, and options. No live trading execution.
        </p>
      </header>

      {error && <div className="rounded border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}

      <section className="grid grid-cols-1 gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <label className="text-sm text-slate-600">
          Client
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            value={selectedClientId ?? ''}
            onChange={(event) => void selectClient(event.target.value)}
          >
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-600">
          Portfolio
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            value={selectedPortfolioId ?? ''}
            onChange={(event) => void selectPortfolio(event.target.value)}
          >
            <option value="">Select portfolio</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        </label>

        <div className="text-xs text-slate-500">
          Base Currency: INR
          <br />
          Cost Basis: FIFO default (Average Cost supported)
          <br />
          Price Mode: API or Manual fallback
        </div>
      </section>

      {selectedClientId && selectedPortfolioId && (
        <TradeEntryForm
          clientId={selectedClientId}
          portfolioId={selectedPortfolioId}
          instruments={instruments}
          onSubmit={addTrade}
        />
      )}

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-600">
          Filter by Segment
          <select
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1"
            value={segmentFilter}
            onChange={(event) => setSegmentFilter(event.target.value)}
          >
            <option value="ALL">ALL</option>
            <option value="EQUITY">EQUITY</option>
            <option value="FUTURES">FUTURES</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
        </label>

        <label className="text-sm text-slate-600">
          Filter by Date
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1"
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </label>
      </section>

      <SummaryCards
        totalRealizedPnL={computation.totalRealizedPnL}
        totalUnrealizedPnL={computation.totalUnrealizedPnL}
        totalFees={computation.totalFees}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <OpenPositionsTable positions={openPositions} />
        <ClosedPositionsTable positions={closedPositions} />
      </div>

      {openPositions[0] && (
        <ManualPriceEditor symbol={openPositions[0].symbol} onSave={setManualPrice} />
      )}

      <TradeHistoryTable trades={filteredTrades} />
    </main>
  )
}
