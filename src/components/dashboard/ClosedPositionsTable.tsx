import type { PositionSummary } from '../../domain/types'
import { formatINR } from '../../utils/formatters'

export const ClosedPositionsTable = ({ positions }: { positions: PositionSummary[] }) => (
  <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="mb-3 text-lg font-semibold text-slate-800">Closed Positions</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2">Symbol</th>
            <th className="py-2">Segment</th>
            <th className="py-2">Realized P/L</th>
          </tr>
        </thead>
        <tbody>
          {positions.length === 0 ? (
            <tr>
              <td className="py-3 text-slate-400" colSpan={3}>
                No closed positions.
              </td>
            </tr>
          ) : (
            positions.map((row) => (
              <tr key={row.instrumentId} className="border-b border-slate-100">
                <td className="py-2">{row.symbol}</td>
                <td className="py-2">{row.segment}</td>
                <td className={`py-2 ${row.realizedPnL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatINR(row.realizedPnL)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)
