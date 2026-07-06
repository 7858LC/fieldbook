"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ConvertToJobButton({ quoteId }: { quoteId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function convert() {
    setLoading(true)
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId }),
    })
    if (res.ok) {
      const data = await res.json()
      router.push(`/jobs/${data.id}`)
    } else {
      alert("Failed to create job")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={convert}
      disabled={loading}
      className="w-full bg-green-700 text-white rounded-2xl py-3 font-semibold hover:bg-green-800 disabled:opacity-60 transition-colors"
    >
      {loading ? "Creating Job…" : "Convert to Job →"}
    </button>
  )
}
