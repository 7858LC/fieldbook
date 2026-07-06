"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Job = {
  id: string
  status: string
  actualLaborCost: number
  actualMaterialCost: number
}

type CrewMember = { id: string; name: string }

export default function JobActions({ job, crewMembers }: { job: Job; crewMembers: CrewMember[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState("")
  const [laborCost, setLaborCost] = useState(job.actualLaborCost.toString())
  const [materialCost, setMaterialCost] = useState(job.actualMaterialCost.toString())
  const [crewId, setCrewId] = useState(crewMembers[0]?.id ?? "")

  async function patch(body: object) {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) router.refresh()
  }

  async function checkIn() {
    if (!crewId) return
    setLoading("checkin")
    await patch({ action: "checkin", crewMemberId: crewId })
    setLoading("")
  }

  async function start() {
    setLoading("start")
    await patch({ action: "start" })
    setLoading("")
  }

  async function complete() {
    setLoading("complete")
    await patch({
      action: "complete",
      actualLaborCost: parseFloat(laborCost) || 0,
      actualMaterialCost: parseFloat(materialCost) || 0,
    })
    setLoading("")
  }

  async function createInvoice() {
    setLoading("invoice")
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id }),
    })
    if (res.ok) {
      const data = await res.json()
      router.push(`/invoices/${data.id}`)
    }
    setLoading("")
  }

  return (
    <div className="space-y-3">
      {job.status === "scheduled" && (
        <button
          onClick={start}
          disabled={loading === "start"}
          className="w-full bg-yellow-500 text-white rounded-2xl py-3 font-semibold hover:bg-yellow-600 disabled:opacity-60"
        >
          {loading === "start" ? "Starting…" : "Start Job"}
        </button>
      )}

      {(job.status === "scheduled" || job.status === "in_progress") && crewMembers.length > 0 && (
        <div className="flex gap-2">
          <select
            value={crewId}
            onChange={e => setCrewId(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            {crewMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button
            onClick={checkIn}
            disabled={loading === "checkin"}
            className="bg-green-700 text-white px-4 rounded-xl font-medium text-sm hover:bg-green-800 disabled:opacity-60"
          >
            Check In
          </button>
        </div>
      )}

      {job.status === "in_progress" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="text-sm font-medium text-gray-700">Close Job — Enter Actual Costs</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Labor Cost ($)</label>
              <input
                type="number"
                min="0"
                value={laborCost}
                onChange={e => setLaborCost(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Material Cost ($)</label>
              <input
                type="number"
                min="0"
                value={materialCost}
                onChange={e => setMaterialCost(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 mt-1"
              />
            </div>
          </div>
          <button
            onClick={complete}
            disabled={loading === "complete"}
            className="w-full bg-green-700 text-white rounded-xl py-3 font-semibold hover:bg-green-800 disabled:opacity-60"
          >
            {loading === "complete" ? "Closing…" : "Complete Job"}
          </button>
        </div>
      )}

      {job.status === "completed" && (
        <button
          onClick={createInvoice}
          disabled={loading === "invoice"}
          className="w-full bg-green-700 text-white rounded-2xl py-3 font-semibold hover:bg-green-800 disabled:opacity-60"
        >
          {loading === "invoice" ? "Creating…" : "Create Invoice"}
        </button>
      )}
    </div>
  )
}
