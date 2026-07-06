import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession } from "@/lib/session"
import { z } from "zod"

const schema = z.object({
  quoteId: z.string().cuid(),
})

export async function POST(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = session.user.businessId
  if (!businessId) return NextResponse.json({ error: "No business" }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const quote = await prisma.quote.findFirst({ where: { id: parsed.data.quoteId, businessId } })
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 })

  const job = await prisma.job.create({
    data: {
      businessId,
      customerId: quote.customerId,
      quoteId: quote.id,
      estimatedCost: quote.totalEstimated,
      status: "scheduled",
    },
  })

  await prisma.quote.update({ where: { id: quote.id }, data: { status: "accepted" } })

  return NextResponse.json({ id: job.id })
}
