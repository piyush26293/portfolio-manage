import { useState } from 'react'

interface ManualPriceEditorProps {
  symbol: string
  onSave: (symbol: string, value: number) => void
}

export const ManualPriceEditor = ({ symbol, onSave }: ManualPriceEditorProps) => {
  const [price, setPrice] = useState('')

  return (
    <form
      className="flex items-end gap-2 rounded border border-slate-200 bg-white p-3 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault()
        const value = Number(price)
        if (!Number.isFinite(value) || value < 0) return
        onSave(symbol, value)
        setPrice('')
      }}
    >
      <label className="flex flex-col text-sm text-slate-600">
        Manual Price ({symbol})
        <input
          className="mt-1 rounded border border-slate-300 px-2 py-1"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
      </label>
      <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" type="submit">
        Update
      </button>
    </form>
  )
}
