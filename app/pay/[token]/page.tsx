import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ paid?: string }>
}) {
  const { token } = await params
  const { paid } = await searchParams

  const invoice = await prisma.invoice.findUnique({
    where: { shareToken: token },
    include: {
      job: {
        include: {
          customer: true,
          business: { select: { name: true } },
          quote: { include: { lineItems: true } },
        },
      },
    },
  })

  if (!invoice) notFound()

  const justPaid = paid === "1" || invoice.status === "paid"

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-green-700">
            {invoice.job.business.name}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">Invoice</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="text-sm text-gray-500">Bill to</div>
            <div className="text-lg font-semibold text-gray-900 mt-0.5">{invoice.job.customer.name}</div>
          </div>

          {invoice.job.quote && (
            <div className="divide-y divide-gray-100">
              {invoice.job.quote.lineItems.map((item: { id: string; name: string; quantity: number; unit: string; total: number }) => (
                <div key={item.id} className="px-6 py-4 flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.quantity} {item.unit}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 ml-4">${item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
            <div className="text-sm font-medium text-gray-700">Total Due</div>
            <div className="text-2xl font-bold text-gray-900">${invoice.amount.toFixed(2)}</div>
          </div>

          <div className="px-6 py-5 border-t border-gray-100">
            {justPaid ? (
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 font-medium text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Payment received — thank you!
                </div>
                {invoice.paidAt && (
                  <p className="text-xs text-gray-400">
                    Paid {new Date(invoice.paidAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <a
                  href={invoice.stripePaymentLink ?? "#"}
                  className="block w-full text-center bg-green-700 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-green-800 transition-colors"
                >
                  Pay ${invoice.amount.toFixed(2)} →
                </a>
                <p className="text-xs text-gray-400 text-center">
                  Secure payment powered by Stripe · No account needed
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          Powered by FieldBook · UzimzAmka
        </div>
      </div>
    </div>
  )
}
