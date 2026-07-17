import { redirect, notFound } from "next/navigation"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/db"
import Link from "next/link"
import ConvertToJobButton from "@/components/ConvertToJobButton"
import SendQuoteButton from "@/components/SendQuoteButton"

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) redirect("/login")
  const businessId = session.user.businessId
  if (!businessId) redirect("/onboard")

  const { id } = await params
  const quote = await prisma.quote.findFirst({
    where: { id, businessId },
    include: { customer: true, lineItems: true, job: true },
  })
  if (!quote) notFound()

  const laborTotal = quote.lineItems.reduce((s, l) => s + l.laborRate * l.quantity, 0)
  const materialTotal = quote.lineItems.reduce((s, l) => s + l.materialCost * l.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <Link href="/quotes" className="text-sm text-gray-500 hover:text-green-700">← Quotes</Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-lg font-bold text-gray-900">{quote.customer.name}</h1>
          <StatusBadge status={quote.status} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 text-sm font-medium text-gray-500">Line Items</div>
          {quote.lineItems.map((item: { id: string; name: string; quantity: number; unit: string; total: number }) => (
            <div key={item.id} className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {item.quantity} {item.unit} · Labor ${item.laborRate}/unit · Materials ${item.materialCost}/unit
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">${item.total.toFixed(2)}</div>
            </div>
          ))}
          <div className="px-5 py-4 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Labor</span><span>${laborTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Materials</span><span>${materialTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span><span>${quote.totalEstimated.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
            <div className="text-xs text-gray-400 mb-1">Notes</div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {quote.status !== "accepted" && (
          <SendQuoteButton quoteId={quote.id} existingToken={quote.shareToken} />
        )}

        {!quote.job && <ConvertToJobButton quoteId={quote.id} />}

        {quote.job && (
          <Link
            href={`/jobs/${quote.job.id}`}
            className="block w-full text-center border border-green-700 text-green-700 rounded-2xl py-3 font-semibold hover:bg-green-50"
          >
            View Job →
          </Link>
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
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  )
}
