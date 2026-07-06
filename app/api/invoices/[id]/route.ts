import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession } from "@/lib/session"
import { z } from "zod"

const schema = z.object({ status: z.enum(["paid", "unpaid"]) })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = session.user.businessId
  if (!businessId) return NextResponse.json({ error: "No business" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id, job: { businessId } },
  })
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.invoice.update({
    where: { id },
    data: {
      status: parsed.data.status,
      paidAt: parsed.data.status === "paid" ? new Date() : null,
    },
  })

  return NextResponse.json({ ok: true })
}
