import { redirect } from "next/navigation"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { computeInsight } from "@/lib/insights/compute"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await requireSession()
  if (!session) redirect("/login")
  const businessId = session.user.businessId
  if (!businessId) redirect("/onboard")

  const [quoteCount, jobCount, openInvoiceCount] = await Promise.all([
    prisma.quote.count({ where: { businessId } }),
    prisma.job.count({ where: { businessId } }),
    prisma.invoice.count({ where: { job: { businessId }, status: "unpaid" } }),
  ])

  const recentJobs = await prisma.job.findMany({
    where: { businessId },
    orderBy: { scheduledDate: "desc" },
    take: 5,
    include: { customer: true },
  })

  // Compute fresh insight snapshot (fast — no AI call when no API key)
  const insight = await computeInsight(businessId)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div>
          <div className="font-bold text-green-700 text-lg">FieldBook</div>
          <div className="text-xs text-gray-400">{session.user.businessName}</div>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/quotes" className="text-gray-600 hover:text-green-700">Quotes</Link>
          <Link href="/jobs" className="text-gray-600 hover:text-green-700">Jobs</Link>
          <Link href="/invoices" className="text-gray-600 hover:text-green-700">Invoices</Link>
          <Link href="/proposals/new" className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg font-medium hover:bg-green-100">Proposal</Link>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening today.</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Quotes" value={quoteCount} href="/quotes" />
          <StatCard label="Jobs" value={jobCount} href="/jobs" />
          <StatCard label="Open Invoices" value={openInvoiceCount} href="/invoices" accent={openInvoiceCount > 0} />
        </div>

        {/* Insight card — always shown, richer when data exists */}
        <div className={`rounded-2xl border px-5 py-5 space-y-4 ${insight.estimatedLeakAmount > 0 ? "bg-orange-50 border-orange-200" : "bg-white border-gray-100"}`}>
          <div className="flex items-center justify-between">
            <div className={`text-xs font-semibold uppercase tracking-wider ${insight.estimatedLeakAmount > 0 ? "text-orange-600" : "text-gray-400"}`}>
              {insight.period} · Business Health
            </div>
            {insight.estimatedLeakAmount > 0 && (
              <div className="text-xs text-orange-500 font-medium">
                ~${insight.estimatedLeakAmount.toLocaleString()} estimated leak
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              label="Close Rate"
              value={insight.quoteCount === 0 ? "—" : `${(insight.closeRate * 100).toFixed(0)}%`}
              benchmark={`${(insight.benchmarkCloseRate * 100).toFixed(0)}% industry`}
              ahead={insight.quoteCount > 0 && insight.closeRate >= insight.benchmarkCloseRate}
              hasData={insight.quoteCount > 0}
            />
            <Metric
              label="Avg Job Value"
              value={insight.avgJobValue > 0 ? `$${insight.avgJobValue.toFixed(0)}` : "—"}
              benchmark={`$${insight.benchmarkJobValue.toLocaleString()} industry`}
              ahead={insight.avgJobValue >= insight.benchmarkJobValue}
              hasData={insight.avgJobValue > 0}
            />
            <Metric label="Revenue (paid)" value={insight.totalRevenue > 0 ? `$${insight.totalRevenue.toLocaleString()}` : "—"} />
            <Metric label="Jobs Complete" value={String(insight.jobCount)} />
          </div>

          {insight.narrative ? (
            <p className="text-sm text-orange-900 font-medium">{insight.narrative}</p>
          ) : insight.quoteCount === 0 ? (
            <p className="text-sm text-gray-400">Send your first quote to start seeing business health metrics.</p>
          ) : null}

          {insight.estimatedLeakAmount > 0 && (
            <Link
              href="/proposals/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 hover:text-orange-800"
            >
              Generate vendor proposal →
            </Link>
          )}
        </div>

        {/* Recent jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
            <Link href="/quotes/new" className="text-sm text-green-700 font-medium hover:underline">+ New Quote</Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">No jobs yet. Start with a quote.</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentJobs.map(job => (
                <li key={job.id}>
                  <Link href={`/jobs/${job.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.customer.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : "Unscheduled"}
                      </div>
                    </div>
                    <StatusBadge status={job.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          href="/quotes/new"
          className="block w-full bg-green-700 text-white text-center rounded-2xl py-4 font-semibold text-lg hover:bg-green-800 transition-colors"
        >
          + New Quote
        </Link>
      </main>
    </div>
  )
}

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-2xl p-4 text-center border transition-colors hover:border-green-200 ${
        accent ? "bg-orange-50 border-orange-200" : "bg-white border-gray-100"
      }`}
    >
      <div className={`text-2xl font-bold ${accent ? "text-orange-600" : "text-gray-900"}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </Link>
  )
}

function Metric({ label, value, benchmark, ahead, hasData }: {
  label: string
  value: string
  benchmark?: string
  ahead?: boolean
  hasData?: boolean
}) {
  const showBenchmark = benchmark && hasData
  return (
    <div className="bg-white rounded-xl px-3 py-3 border border-gray-100">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-lg font-bold ${showBenchmark && !ahead ? "text-orange-600" : "text-gray-900"}`}>{value}</div>
      {showBenchmark && (
        <div className={`text-xs mt-0.5 font-medium ${ahead ? "text-green-600" : "text-orange-500"}`}>
          {ahead ? "▲" : "▼"} {benchmark}
        </div>
      )}
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
