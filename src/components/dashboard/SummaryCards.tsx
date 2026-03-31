import { SummaryCard } from '../ui/SummaryCard'

interface SummaryCardsProps {
  totalRealizedPnL: number
  totalUnrealizedPnL: number
  totalFees: number
}

export const SummaryCards = ({
  totalRealizedPnL,
  totalUnrealizedPnL,
  totalFees,
}: SummaryCardsProps) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
    <SummaryCard label="Realized P/L" value={totalRealizedPnL} />
    <SummaryCard label="Unrealized P/L" value={totalUnrealizedPnL} />
    <SummaryCard label="Total Fees" value={-Math.abs(totalFees)} />
  </div>
)
