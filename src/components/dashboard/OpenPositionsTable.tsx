import type { PositionSummary } from '../../domain/types'
import { formatINR } from '../../utils/formatters'

export const OpenPositionsTable = ({ positions }: { positions: PositionSummary[] }) => (
  <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="mb-3 text-lg font-semibold text-slate-800">Open Positions</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2">Symbol</th>
            <th className="py-2">Segment</th>
            <th className="py-2">Qty</th>
            <th className="py-2">Avg Cost</th>
            <th className="py-2">Current</th>
            <th className="py-2">Unrealized P/L</th>
          </tr>
        </thead>
        <tbody>
          {positions.length === 0 ? (
            <tr>
              <td className="py-3 text-slate-400" colSpan={6}>
                No open positions.
              </td>
            </tr>
          ) : (
            positions.map((row) => (
              <tr key={row.instrumentId} className="border-b border-slate-100">
                <td className="py-2">{row.symbol}</td>
                <td className="py-2">{row.segment}</td>
                <td className="py-2">{row.quantity}</td>
                <td className="py-2">{formatINR(row.averageCost)}</td>
                <td className="py-2">{formatINR(row.currentPrice)}</td>
                <td className={`py-2 ${row.unrealizedPnL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatINR(row.unrealizedPnL)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)
