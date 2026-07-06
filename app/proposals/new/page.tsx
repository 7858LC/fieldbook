"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { VERTICALS, type PainKey } from "@/lib/verticals/config"

const VERTICAL_KEYS = Object.keys(VERTICALS)

type PainsState = Record<PainKey, boolean>

const DEFAULT_PAINS: PainsState = {
  quotesByGut: false,
  lateInvoicing: false,
  noJobCosting: false,
  clientFollowUp: false,
  noCrewTracking: false,
  cashFlowProblems: false,
}

export default function ProposalPage() {
  const { data: session } = useSession()
  const [vendorName, setVendorName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [vertical, setVertical] = useState("landscaping")
  const [revenue, setRevenue] = useState("")
  const [years, setYears] = useState("")
  const [crew, setCrew] = useState("")
  const [pains, setPains] = useState<PainsState>(DEFAULT_PAINS)
  const [state, setState] = useState<"idle" | "generating" | "error">("idle")
  const [error, setError] = useState("")

  // Pre-fill vertical from logged-in business
  useEffect(() => {
    if (session?.user?.businessName) {
      setBusinessName(session.user.businessName)
    }
  }, [session])

  const vc = VERTICALS[vertical] ?? VERTICALS.landscaping
  const benchmark = vc

  function togglePain(key: PainKey) {
    setPains(p => ({ ...p, [key]: !p[key] }))
  }

  async function handleGenerate() {
    if (!vendorName || !businessName || !revenue || !years || !crew) {
      setError("Please fill in all fields.")
      return
    }
    if (!Object.values(pains).some(Boolean)) {
      setError("Select at least one pain point.")
      return
    }

    setState("generating")
    setError("")

    const res = await fetch("/api/proposals/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorName,
        businessName,
        vertical,
        estimatedAnnualRevenue: parseFloat(revenue.replace(/,/g, "")),
        yearsInBusiness: parseInt(years),
        crewSize: parseInt(crew),
        pains,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to generate proposal.")
      setState("error")
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `FieldBook-Proposal-${businessName.replace(/\s+/g, "-")}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setState("idle")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-green-700 text-lg">FieldBook</Link>
        <span className="text-xs text-gray-400 uppercase tracking-widest">Proposal Generator</span>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit Leak Proposal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in what you know about the vendor. Claude writes the narrative and builds the PDF.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vendor Info</div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Owner Name" value={vendorName} onChange={setVendorName} placeholder="Marcus Green" />
            <Field label="Business Name" value={businessName} onChange={setBusinessName} placeholder="Green Turf LLC" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trade / Vertical</label>
            <select
              value={vertical}
              onChange={e => setVertical(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {VERTICAL_KEYS.map(k => (
                <option key={k} value={k}>{VERTICALS[k].icon} {VERTICALS[k].displayName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Est. Annual Revenue ($)" value={revenue} onChange={setRevenue} placeholder="450000" />
            <Field label="Years in Business" value={years} onChange={setYears} placeholder="7" />
            <Field label="Crew Size" value={crew} onChange={setCrew} placeholder="4" />
          </div>

          {/* Benchmark comparison */}
          {revenue && parseFloat(revenue.replace(/,/g, "")) > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{vc.icon} {vc.displayName} Industry Benchmarks</div>
              <BenchRow label="Avg job value" value={`$${benchmark.avgJobValue.toLocaleString()}`} />
              <BenchRow label="Close rate" value={`${(benchmark.benchmarkCloseRate * 100).toFixed(0)}%`} />
              <BenchRow label="Proposal hook" value={benchmark.proposalHook} italic />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Observed Pain Points</div>
          <p className="text-sm text-gray-500">Check everything you see in their operation.</p>

          <div className="space-y-2">
            {(Object.keys(DEFAULT_PAINS) as PainKey[]).map(key => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => togglePain(key)}
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                    pains[key] ? "bg-green-700 border-green-700" : "border-gray-300 group-hover:border-green-400"
                  }`}
                >
                  {pains[key] && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span onClick={() => togglePain(key)} className="text-sm text-gray-700 select-none">
                  {vc.painLabels[key]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={state === "generating"}
          className="w-full bg-green-700 text-white rounded-2xl py-4 font-semibold text-base hover:bg-green-800 disabled:opacity-60 transition-colors"
        >
          {state === "generating" ? "Generating proposal…" : "Generate Proposal PDF"}
        </button>

        {state === "generating" && (
          <p className="text-center text-sm text-gray-400">
            Claude is writing the narrative. This takes about 10 seconds.
          </p>
        )}
      </main>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
      />
    </div>
  )
}

function BenchRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div className="flex justify-between items-start text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-700 font-medium text-right max-w-[60%] ${italic ? "italic" : ""}`}>{value}</span>
    </div>
  )
}
