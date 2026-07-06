import { redirect, notFound } from "next/navigation"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/db"
import Link from "next/link"
import MarkPaidButton from "@/components/MarkPaidButton"
import SendInvoiceButton from "@/components/SendInvoiceButton"

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) redirect("/login")
  const businessId = session.user.businessId
  if (!businessId) redirect("/onboard")

  const { id } = await params
  const invoice = await prisma.invoice.findFirst({
    where: { id, job: { businessId } },
    include: { job: { include: { customer: true, quote: { include: { lineItems: true } } } } },
  })
  if (!invoice) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <Link href="/invoices" className="text-sm text-gray-500 hover:text-green-700">← Invoices</Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-lg font-bold text-gray-900">{invoice.job.customer.name}</h1>
          <StatusBadge status={invoice.status} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <div className="text-xs text-gray-400">Amount Due</div>
          <div className="text-4xl font-bold text-gray-900 mt-1">${invoice.amount.toFixed(2)}</div>
          {invoice.paidAt && (
            <div className="text-xs text-green-600 mt-2">Paid {new Date(invoice.paidAt).toLocaleDateString()}</div>
          )}
        </div>

        {invoice.job.quote && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 text-sm font-medium text-gray-500">Services</div>
            {invoice.job.quote.lineItems.map(item => (
              <div key={item.id} className="px-5 py-3 flex items-center justify-between border-b border-gray-50 last:border-0">
                <div className="text-sm text-gray-700">{item.name} × {item.quantity}</div>
                <div className="text-sm font-medium text-gray-900">${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        {invoice.stripePaymentLink && (
          <a
            href={invoice.stripePaymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-600 text-white rounded-2xl py-3 font-semibold hover:bg-blue-700"
          >
            Pay Now (Stripe) →
          </a>
        )}

        {invoice.status === "unpaid" && (
          <>
            <SendInvoiceButton invoiceId={invoice.id} />
            <MarkPaidButton invoiceId={invoice.id} />
          </>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { unpaid: "bg-orange-100 text-orange-700", paid: "bg-green-100 text-green-700" }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  )
}
