import type { Trade } from '../../domain/types'
import { formatDateTime, formatINR } from '../../utils/formatters'

export const TradeHistoryTable = ({ trades }: { trades: Trade[] }) => (
  <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="mb-3 text-lg font-semibold text-slate-800">Trade History</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2">Date</th>
            <th className="py-2">Client</th>
            <th className="py-2">Segment</th>
            <th className="py-2">Symbol</th>
            <th className="py-2">Side</th>
            <th className="py-2">Qty</th>
            <th className="py-2">Price</th>
            <th className="py-2">Fee</th>
          </tr>
        </thead>
        <tbody>
          {trades.length === 0 ? (
            <tr>
              <td className="py-3 text-slate-400" colSpan={8}>
                No trades yet.
              </td>
            </tr>
          ) : (
            trades.map((trade) => (
              <tr key={trade.id} className="border-b border-slate-100">
                <td className="py-2">{formatDateTime(trade.tradeDateTime)}</td>
                <td className="py-2">{trade.clientId}</td>
                <td className="py-2">{trade.segment}</td>
                <td className="py-2">{trade.symbol}</td>
                <td className="py-2">{trade.transactionType}</td>
                <td className="py-2">{trade.quantity}</td>
                <td className="py-2">{formatINR(trade.price)}</td>
                <td className="py-2">{formatINR(trade.fee)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)
