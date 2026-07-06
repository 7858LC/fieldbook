"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markPaid() {
    setLoading(true)
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={markPaid}
      disabled={loading}
      className="w-full border border-green-700 text-green-700 rounded-2xl py-3 font-semibold hover:bg-green-50 disabled:opacity-60"
    >
      {loading ? "Marking paid…" : "Mark as Paid"}
    </button>
  )
}
