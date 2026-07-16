export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { requireSession } from "@/lib/session"
import { z } from "zod"
import crypto from "crypto"

const schema = z.object({ invoiceId: z.string().cuid() })

export async function POST(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = session.user.businessId
  if (!businessId) return NextResponse.json({ error: "No business" }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const invoice = await prisma.invoice.findFirst({
    where: { id: parsed.data.invoiceId, job: { businessId } },
    include: { job: { include: { customer: true, quote: true } } },
  })
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (invoice.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 409 })

  // Reuse existing payment link if one exists
  if (invoice.stripePaymentLink && invoice.shareToken) {
    return NextResponse.json({
      payUrl: `${process.env.NEXTAUTH_URL}/pay/${invoice.shareToken}`,
    })
  }

  const shareToken = crypto.randomBytes(24).toString("hex")
  const description = invoice.job.quote
    ? `Services for ${invoice.job.customer.name}`
    : `Invoice â€” ${invoice.job.customer.name}`

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: description },
          unit_amount: Math.round(invoice.amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/pay/${shareToken}?paid=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pay/${shareToken}`,
    metadata: { invoiceId: invoice.id, shareToken },
  })

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      stripePaymentLink: checkoutSession.url,
      shareToken,
    },
  })

  return NextResponse.json({ payUrl: `${process.env.NEXTAUTH_URL}/pay/${shareToken}` })
}

