export const formatINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-IN', { hour12: false })
