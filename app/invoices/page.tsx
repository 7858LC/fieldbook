import { redirect } from "next/navigation"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function InvoicesPage() {
  const session = await requireSession()
  if (!session) redirect("/login")
  const businessId = session.user.businessId
  if (!businessId) redirect("/onboard")

  const invoices = await prisma.invoice.findMany({
    where: { job: { businessId } },
    orderBy: { createdAt: "desc" },
    include: { job: { include: { customer: true } } },
  })

  const unpaidTotal = invoices.filter(i => i.status === "unpaid").reduce((s, i) => s + i.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-green-700 text-lg">FieldBook</Link>
        {unpaidTotal > 0 && (
          <span className="text-sm font-semibold text-orange-600">${unpaidTotal.toFixed(2)} outstanding</span>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Invoices</h1>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            No invoices yet. Complete a job to create one.
          </div>
        ) : (
          <ul className="space-y-3">
            {invoices.map(inv => (
              <li key={inv.id}>
                <Link
                  href={`/invoices/${inv.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-green-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{inv.job.customer.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(inv.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${inv.amount.toFixed(2)}</div>
                      <StatusBadge status={inv.status} />
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
  const map: Record<string, string> = { unpaid: "bg-orange-100 text-orange-700", paid: "bg-green-100 text-green-700" }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  )
}
