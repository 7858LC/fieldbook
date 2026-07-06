"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function OnboardPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState("")
  const [vertical, setVertical] = useState("landscaping")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, vertical }),
    })

    if (res.ok) {
      router.push("/dashboard")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-green-700">FieldBook</div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Set up your business</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Acme Landscaping"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trade / Vertical</label>
            <select
              value={vertical}
              onChange={e => setVertical(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="landscaping">Landscaping</option>
              <option value="hvac">HVAC</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="painting">Painting</option>
              <option value="roofing">Roofing</option>
              <option value="general">General Contracting</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white rounded-xl py-3 font-medium hover:bg-green-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Creating…" : "Create Business"}
          </button>
        </form>
      </div>
    </div>
  )
}
