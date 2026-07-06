import { redirect, notFound } from "next/navigation"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/db"
import Link from "next/link"
import JobActions from "@/components/JobActions"

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) redirect("/login")
  const businessId = session.user.businessId
  if (!businessId) redirect("/onboard")

  const { id } = await params
  const job = await prisma.job.findFirst({
    where: { id, businessId },
    include: {
      customer: true,
      quote: { include: { lineItems: true } },
      checkIns: { include: { crewMember: true }, orderBy: { checkInAt: "desc" } },
      invoice: true,
    },
  })
  if (!job) notFound()

  const crewMembers = await prisma.crewMember.findMany({ where: { businessId } })
  const actualTotal = job.actualLaborCost + job.actualMaterialCost

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <Link href="/jobs" className="text-sm text-gray-500 hover:text-green-700">← Jobs</Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-lg font-bold text-gray-900">{job.customer.name}</h1>
          <StatusBadge status={job.status} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400">Estimated</div>
              <div className="text-xl font-bold text-gray-900 mt-1">${job.estimatedCost.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Actual Cost</div>
              <div className="text-xl font-bold text-gray-900 mt-1">${actualTotal.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Margin</div>
              <MarginDisplay estimated={job.estimatedCost} actual={actualTotal} />
            </div>
          </div>
          {job.status === "completed" && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-500 border-t border-gray-100 pt-4">
              <div>Labor: <strong>${job.actualLaborCost.toFixed(2)}</strong></div>
              <div>Materials: <strong>${job.actualMaterialCost.toFixed(2)}</strong></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 text-sm font-medium text-gray-500">Crew</div>
          {job.checkIns.length === 0 ? (
            <div className="px-5 py-6 text-center text-gray-400 text-sm">No crew checked in yet.</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {job.checkIns.map(ci => (
                <li key={ci.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{ci.crewMember.name}</div>
                    <div className="text-xs text-gray-400">
                      In: {new Date(ci.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {ci.checkOutAt && ` · Out: ${new Date(ci.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <JobActions job={job} crewMembers={crewMembers} />

        {job.invoice && (
          <Link href={`/invoices/${job.invoice.id}`} className="block w-full text-center border border-green-700 text-green-700 rounded-2xl py-3 font-semibold hover:bg-green-50">
            View Invoice — ${job.invoice.amount.toFixed(2)} ({job.invoice.status})
          </Link>
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

function MarginDisplay({ estimated, actual }: { estimated: number; actual: number }) {
  if (!estimated) return <div className="text-xl font-bold text-gray-400 mt-1">—</div>
  const pct = ((estimated - actual) / estimated) * 100
  const color = pct >= 20 ? "text-green-600" : pct >= 0 ? "text-yellow-600" : "text-red-600"
  return <div className={`text-xl font-bold mt-1 ${color}`}>{pct.toFixed(0)}%</div>
}
