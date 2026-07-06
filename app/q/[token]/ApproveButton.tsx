"use client"

import { useState } from "react"

export default function ApproveButton({ token, total }: { token: string; total: number }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "done">("idle")
  const [error, setError] = useState("")

  async function handleApprove() {
    setState("loading")
    setError("")
    const res = await fetch(`/api/q/${token}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || undefined, email: email || undefined }),
    })
    if (res.ok) {
      setState("done")
    } else {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      setState("idle")
    }
  }

  if (state === "done") {
    return (
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 font-medium text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Quote approved — your contractor has been notified
        </div>
        {email && (
          <p className="text-xs text-gray-400">We&apos;ll send updates to {email}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 text-center">
        By tapping Approve, you authorize work totaling{" "}
        <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>.
      </p>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <input
          type="email"
          placeholder="Email for updates (optional)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <button
        onClick={handleApprove}
        disabled={state === "loading"}
        className="w-full bg-green-700 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-green-800 disabled:opacity-60 transition-colors"
      >
        {state === "loading" ? "Approving…" : "Approve This Quote"}
      </button>
      <p className="text-xs text-gray-400 text-center">
        No account needed · Your info is never sold or shared
      </p>
    </div>
  )
}
