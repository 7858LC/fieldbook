"use client"

import { useState } from "react"

export default function SendQuoteButton({ quoteId, existingToken }: { quoteId: string; existingToken?: string | null }) {
  const [link, setLink] = useState(existingToken ? `${window.location.origin}/q/${existingToken}` : "")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSend() {
    setLoading(true)
    const res = await fetch(`/api/quotes/${quoteId}/send`, { method: "POST" })
    const data = await res.json()
    setLink(data.approvalUrl)
    setLoading(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 space-y-3">
      <div className="text-sm font-medium text-gray-700">Send to Client</div>
      {link ? (
        <>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 bg-gray-50 truncate"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-400">Share this link with your client. They can approve without an account.</p>
        </>
      ) : (
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-green-700 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-800 disabled:opacity-60 transition-colors"
        >
          {loading ? "Generating link…" : "Generate Approval Link"}
        </button>
      )}
    </div>
  )
}
