import { useMemo, useState } from 'react'
import { SEGMENTS, TRANSACTION_TYPES, PRODUCT_TYPES } from '../../domain/enums'
import type { Instrument, Trade } from '../../domain/types'
import { deriveQuantity, validateTradeInput } from '../../utils/validation'

interface TradeEntryFormProps {
  clientId: string
  portfolioId: string
  instruments: Instrument[]
  onSubmit: (trade: Omit<Trade, 'id'>) => Promise<void>
}

export const TradeEntryForm = ({
  clientId,
  portfolioId,
  instruments,
  onSubmit,
}: TradeEntryFormProps) => {
  const [form, setForm] = useState({
    instrumentId: '',
    segment: 'EQUITY' as Trade['segment'],
    transactionType: 'BUY' as Trade['transactionType'],
    productType: 'CNC' as Trade['productType'],
    quantity: '1',
    lots: '1',
    lotSize: '1',
    price: '0',
    fee: '0',
    tradeDateTime: new Date().toISOString().slice(0, 16),
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const selectedInstrument = useMemo(
    () => instruments.find((inst) => inst.id === form.instrumentId),
    [instruments, form.instrumentId],
  )

  return (
    <form
      className="grid grid-cols-1 gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3"
      onSubmit={async (event) => {
        event.preventDefault()

        const quantityNum = Number(form.quantity)
        const lotsNum = Number(form.lots)
        const lotSizeNum = Number(form.lotSize)
        const derivedQty = deriveQuantity(form.segment, quantityNum, lotsNum, lotSizeNum)

        const payload: Omit<Trade, 'id'> = {
          clientId,
          portfolioId,
          instrumentId: form.instrumentId,
          instrumentName: selectedInstrument?.name ?? '',
          symbol: selectedInstrument?.symbol ?? '',
          exchange: selectedInstrument?.exchange ?? 'NSE',
          segment: form.segment,
          transactionType: form.transactionType,
          productType: form.productType,
          quantity: derivedQty,
          lots: form.segment === 'EQUITY' ? undefined : lotsNum,
          lotSize: form.segment === 'EQUITY' ? undefined : lotSizeNum,
          price: Number(form.price),
          fee: Number(form.fee),
          strikePrice: selectedInstrument?.strikePrice,
          expiryDate: selectedInstrument?.expiryDate,
          optionType: selectedInstrument?.optionType,
          tradeDateTime: new Date(form.tradeDateTime).toISOString(),
          notes: form.notes,
        }

        const validation = validateTradeInput(payload, Boolean(selectedInstrument), submitting)
        if (!validation.isValid) {
          setErrors(validation.errors)
          return
        }

        setSubmitting(true)
        setErrors({})
        try {
          await onSubmit(payload)
          setForm((prev) => ({ ...prev, notes: '' }))
        } finally {
          setSubmitting(false)
        }
      }}
    >
      <label className="text-sm text-slate-600">
        Instrument
        <select
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          value={form.instrumentId}
          onChange={(e) => {
            const instrument = instruments.find((x) => x.id === e.target.value)
            setForm((prev) => ({
              ...prev,
              instrumentId: e.target.value,
              segment: instrument?.segment ?? prev.segment,
              lotSize: instrument?.lotSize ? String(instrument.lotSize) : prev.lotSize,
            }))
          }}
        >
          <option value="">Select instrument</option>
          {instruments.map((instrument) => (
            <option key={instrument.id} value={instrument.id}>
              {instrument.name} ({instrument.segment})
            </option>
          ))}
        </select>
        {errors.instrumentId && <span className="text-xs text-rose-600">{errors.instrumentId}</span>}
      </label>

      <label className="text-sm text-slate-600">
        Segment
        <select
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          value={form.segment}
          onChange={(e) => setForm((prev) => ({ ...prev, segment: e.target.value as Trade['segment'] }))}
        >
          {SEGMENTS.map((segment) => (
            <option key={segment} value={segment}>
              {segment}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-slate-600">
        Side
        <select
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          value={form.transactionType}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, transactionType: e.target.value as Trade['transactionType'] }))
          }
        >
          {TRANSACTION_TYPES.map((transactionType) => (
            <option key={transactionType} value={transactionType}>
              {transactionType}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-slate-600">
        Product
        <select
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          value={form.productType}
          onChange={(e) => setForm((prev) => ({ ...prev, productType: e.target.value as Trade['productType'] }))}
        >
          {PRODUCT_TYPES.map((productType) => (
            <option key={productType} value={productType}>
              {productType}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-slate-600">
        Quantity
        <input
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          type="number"
          min="1"
          value={form.quantity}
          onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
        />
        {errors.quantity && <span className="text-xs text-rose-600">{errors.quantity}</span>}
      </label>

      {(form.segment === 'FUTURES' || form.segment === 'OPTIONS') && (
        <>
          <label className="text-sm text-slate-600">
            Lots
            <input
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
              type="number"
              min="1"
              value={form.lots}
              onChange={(e) => setForm((prev) => ({ ...prev, lots: e.target.value }))}
            />
            {errors.lots && <span className="text-xs text-rose-600">{errors.lots}</span>}
          </label>
          <label className="text-sm text-slate-600">
            Lot Size
            <input
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
              type="number"
              min="1"
              value={form.lotSize}
              onChange={(e) => setForm((prev) => ({ ...prev, lotSize: e.target.value }))}
            />
            {errors.lotSize && <span className="text-xs text-rose-600">{errors.lotSize}</span>}
          </label>
        </>
      )}

      <label className="text-sm text-slate-600">
        Price
        <input
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
        />
        {errors.price && <span className="text-xs text-rose-600">{errors.price}</span>}
      </label>

      <label className="text-sm text-slate-600">
        Fee
        <input
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          type="number"
          min="0"
          step="0.01"
          value={form.fee}
          onChange={(e) => setForm((prev) => ({ ...prev, fee: e.target.value }))}
        />
        {errors.fee && <span className="text-xs text-rose-600">{errors.fee}</span>}
      </label>

      <label className="text-sm text-slate-600">
        Trade Date/Time
        <input
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          type="datetime-local"
          value={form.tradeDateTime}
          onChange={(e) => setForm((prev) => ({ ...prev, tradeDateTime: e.target.value }))}
        />
        {errors.tradeDateTime && <span className="text-xs text-rose-600">{errors.tradeDateTime}</span>}
      </label>

      <label className="md:col-span-2 text-sm text-slate-600">
        Notes
        <input
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        />
      </label>

      <button
        className="rounded bg-indigo-600 px-3 py-2 text-sm text-white disabled:bg-slate-400"
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Saving...' : 'Add Trade'}
      </button>

      {errors.form && <p className="md:col-span-3 text-sm text-rose-600">{errors.form}</p>}
    </form>
  )
}
