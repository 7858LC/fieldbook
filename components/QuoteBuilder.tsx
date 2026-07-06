"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Customer = { id: string; name: string; address: string | null }
type Template = { id: string; name: string; unit: string; defaultLaborRate: number; defaultMaterialCost: number }

type LineItem = {
  id: string
  serviceTemplateId: string | null
  name: string
  unit: string
  quantity: number
  laborRate: number
  materialCost: number
}

export default function QuoteBuilder({
  customers,
  templates,
}: {
  customers: Customer[]
  templates: Template[]
}) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState("")
  const [newCustomerName, setNewCustomerName] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<LineItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function addLine(template?: Template) {
    const item: LineItem = {
      id: crypto.randomUUID(),
      serviceTemplateId: template?.id ?? null,
      name: template?.name ?? "",
      unit: template?.unit ?? "flat",
      quantity: 1,
      laborRate: template?.defaultLaborRate ?? 0,
      materialCost: template?.defaultMaterialCost ?? 0,
    }
    setItems(prev => [...prev, item])
  }

  function updateLine(id: string, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it))
  }

  function removeLine(id: string) {
    setItems(prev => prev.filter(it => it.id !== id))
  }

  function lineTotal(item: LineItem) {
    return item.quantity * (item.laborRate + item.materialCost)
  }

  const grandTotal = items.reduce((sum, it) => sum + lineTotal(it), 0)

  async function handleSave() {
    if (!customerId && !newCustomerName.trim()) {
      setError("Select or enter a customer name")
      return
    }
    if (items.length === 0) {
      setError("Add at least one line item")
      return
    }
    setSaving(true)
    setError("")

    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customerId || null,
        newCustomerName: newCustomerName.trim() || null,
        notes,
        items: items.map(it => ({
          serviceTemplateId: it.serviceTemplateId,
          name: it.name,
          unit: it.unit,
          quantity: it.quantity,
          laborRate: it.laborRate,
          materialCost: it.materialCost,
          total: lineTotal(it),
        })),
        totalEstimated: grandTotal,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/quotes/${data.id}`)
    } else {
      const data = await res.json()
      setError(data.error ?? "Failed to save quote")
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Customer */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Customer</h2>
        {customers.length > 0 && (
          <select
            value={customerId}
            onChange={e => { setCustomerId(e.target.value); setNewCustomerName("") }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">— Select existing customer —</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        {!customerId && (
          <input
            type="text"
            placeholder="Or enter new customer name"
            value={newCustomerName}
            onChange={e => setNewCustomerName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        )}
      </section>

      {/* Line Items */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Line Items</h2>
        </div>

        {items.length === 0 && (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">
            Add services below to build your quote.
          </div>
        )}

        {items.map((item, idx) => (
          <div key={item.id} className="px-5 py-4 border-b border-gray-50 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5">{idx + 1}</span>
              <input
                type="text"
                value={item.name}
                onChange={e => updateLine(item.id, "name", e.target.value)}
                placeholder="Service name"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button onClick={() => removeLine(item.id)} className="text-gray-300 hover:text-red-500 text-lg leading-none">×</button>
            </div>
            <div className="grid grid-cols-3 gap-2 ml-7">
              <div>
                <label className="text-xs text-gray-400">Qty</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.quantity}
                  onChange={e => updateLine(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Labor / unit</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.laborRate}
                  onChange={e => updateLine(item.id, "laborRate", parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Materials / unit</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.materialCost}
                  onChange={e => updateLine(item.id, "materialCost", parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
            <div className="ml-7 text-right text-sm font-medium text-green-700">
              ${lineTotal(item).toFixed(2)}
            </div>
          </div>
        ))}

        {/* Add line buttons */}
        <div className="px-5 py-4 space-y-2">
          {templates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => addLine(t)}
                  className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5 hover:bg-green-100 transition-colors"
                >
                  + {t.name}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => addLine()}
            className="text-sm text-gray-500 hover:text-green-700 font-medium"
          >
            + Add custom line
          </button>
        </div>
      </section>

      {/* Notes */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
          placeholder="Scope of work, special instructions…"
        />
      </section>

      {/* Total + Save */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600 font-medium">Total Estimate</span>
          <span className="text-2xl font-bold text-gray-900">${grandTotal.toFixed(2)}</span>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-700 text-white rounded-xl py-3 font-semibold hover:bg-green-800 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving…" : "Save Quote"}
        </button>
      </div>
    </div>
  )
}
