import { redirect } from "next/navigation"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/db"
import QuoteBuilder from "@/components/QuoteBuilder"

export default async function NewQuotePage() {
  const session = await requireSession()
  if (!session) redirect("/login")
  const businessId = session.user.businessId
  if (!businessId) redirect("/onboard")

  const [customers, templates] = await Promise.all([
    prisma.customer.findMany({ where: { businessId }, orderBy: { name: "asc" } }),
    prisma.serviceTemplate.findMany({ where: { businessId }, orderBy: { name: "asc" } }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <a href="/quotes" className="text-sm text-gray-500 hover:text-green-700">← Back to Quotes</a>
        <h1 className="text-lg font-bold text-gray-900 mt-1">New Quote</h1>
      </header>
      <QuoteBuilder customers={customers} templates={templates} />
    </div>
  )
}
