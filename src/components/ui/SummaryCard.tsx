import { formatINR } from '../../utils/formatters'

interface SummaryCardProps {
  label: string
  value: number
}

export const SummaryCard = ({ label, value }: SummaryCardProps) => (
  <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`text-xl font-semibold ${value >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
      {formatINR(value)}
    </p>
  </div>
)
