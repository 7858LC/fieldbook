import { redirect } from "next/navigation"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function QuotesPage() {
  const session = await requireSession()
  if (!session) redirect("/login")
  const businessId = session.user.businessId
  if (!businessId) redirect("/onboard")

  const quotes = await prisma.quote.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: { customer: true, lineItems: true },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-green-700 text-lg">FieldBook</Link>
        <Link href="/quotes/new" className="bg-green-700 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-green-800">
          + New Quote
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Quotes</h1>

        {quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            No quotes yet.{" "}
            <Link href="/quotes/new" className="text-green-700 font-medium hover:underline">
              Create your first one
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {quotes.map(q => (
              <li key={q.id}>
                <Link
                  href={`/quotes/${q.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-green-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{q.customer.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {q.lineItems.length} line item{q.lineItems.length !== 1 ? "s" : ""} ·{" "}
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${q.totalEstimated.toFixed(2)}</div>
                      <StatusBadge status={q.status} />
                    </div>
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
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-600",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  )
}
