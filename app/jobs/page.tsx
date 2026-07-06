import { redirect } from "next/navigation"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/db"
import Link from "next/link"

const STATUS_ORDER = ["in_progress", "scheduled", "completed", "cancelled"]

export default async function JobsPage() {
  const session = await requireSession()
  if (!session) redirect("/login")
  const businessId = session.user.businessId
  if (!businessId) redirect("/onboard")

  const jobs = await prisma.job.findMany({
    where: { businessId },
    orderBy: { scheduledDate: "asc" },
    include: { customer: true, invoice: true },
  })

  const sorted = [...jobs].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-green-700 text-lg">FieldBook</Link>
        <span className="text-sm text-gray-400">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Jobs</h1>

        {sorted.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            No jobs yet.{" "}
            <Link href="/quotes/new" className="text-green-700 font-medium hover:underline">
              Start with a quote
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map(job => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-green-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{job.customer.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : "Unscheduled"}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <StatusBadge status={job.status} />
                      {job.invoice && (
                        <div className="text-xs text-orange-500 font-medium">Invoice {job.invoice.status}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span>Est. <strong>${job.estimatedCost.toFixed(0)}</strong></span>
                    {job.status === "completed" && (
                      <>
                        <span>Labor <strong>${job.actualLaborCost.toFixed(0)}</strong></span>
                        <span>Materials <strong>${job.actualMaterialCost.toFixed(0)}</strong></span>
                        <Margin estimated={job.estimatedCost} actual={job.actualLaborCost + job.actualMaterialCost} />
                      </>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.replace("_", " ")}
    </span>
  )
}

function Margin({ estimated, actual }: { estimated: number; actual: number }) {
  if (!estimated) return null
  const pct = ((estimated - actual) / estimated) * 100
  const color = pct >= 20 ? "text-green-600" : pct >= 0 ? "text-yellow-600" : "text-red-600"
  return <span className={`font-semibold ${color}`}>Margin {pct.toFixed(0)}%</span>
}
