import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import ApproveButton from "./ApproveButton"

export default async function ClientQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const quote = await prisma.quote.findUnique({
    where: { shareToken: token },
    include: {
      customer: true,
      lineItems: true,
      business: { select: { name: true, email: true, phone: true } },
    },
  })

  if (!quote) notFound()

  const already = quote.status === "accepted"

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-green-700">
            {quote.business.name ?? "Your Contractor"}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">Quote for Review</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Customer + meta */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="text-sm text-gray-500">Prepared for</div>
            <div className="text-lg font-semibold text-gray-900 mt-0.5">{quote.customer.name}</div>
            {quote.sentAt && (
              <div className="text-xs text-gray-400 mt-1">
                Sent {new Date(quote.sentAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="divide-y divide-gray-100">
            {quote.lineItems.map(item => (
              <div key={item.id} className="px-6 py-4 flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.quantity} {item.unit}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900 ml-4">
                  ${item.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
            <div className="text-sm font-medium text-gray-700">Estimated Total</div>
            <div className="text-xl font-bold text-green-700">${quote.totalEstimated.toFixed(2)}</div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Notes</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</div>
            </div>
          )}

          {/* Approval */}
          <div className="px-6 py-5 border-t border-gray-100">
            {already ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 font-medium text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You approved this quote
                </div>
              </div>
            ) : (
              <ApproveButton token={token} total={quote.totalEstimated} />
            )}
          </div>
        </div>

        <div className="text-center mt-6 space-y-1">
          <div className="text-xs font-semibold text-green-700 tracking-wide">
            Powered by LeadFlow
          </div>
          <div className="text-xs text-gray-400">
            A UzimzAmka network · Fast approvals · Trusted contractors
          </div>
        </div>
      </div>
    </div>
  )
}
