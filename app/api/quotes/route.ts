export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession } from "@/lib/session"
import { z } from "zod"

const lineItemSchema = z.object({
  serviceTemplateId: z.string().cuid().nullable().optional(),
  name: z.string().min(1).max(200),
  unit: z.string().max(50).default("flat"),
  quantity: z.number().positive(),
  laborRate: z.number().min(0),
  materialCost: z.number().min(0),
  total: z.number().min(0),
})

const schema = z.object({
  customerId: z.string().cuid().nullable().optional(),
  newCustomerName: z.string().min(1).max(200).nullable().optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(lineItemSchema).min(1),
  totalEstimated: z.number().min(0),
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

  const { customerId, newCustomerName, notes, items, totalEstimated } = parsed.data

  let resolvedCustomerId = customerId ?? null

  if (!resolvedCustomerId && newCustomerName) {
    const customer = await prisma.customer.create({
      data: { businessId, name: newCustomerName },
    })
    resolvedCustomerId = customer.id
  }

  if (!resolvedCustomerId) {
    return NextResponse.json({ error: "Customer required" }, { status: 400 })
  }

  const customer = await prisma.customer.findFirst({ where: { id: resolvedCustomerId, businessId } })
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

  const quote = await prisma.quote.create({
    data: {
      businessId,
      customerId: resolvedCustomerId,
      notes,
      totalEstimated,
      lineItems: { create: items },
    },
  })

  return NextResponse.json({ id: quote.id })
}

