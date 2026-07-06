import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession } from "@/lib/session"
import crypto from "crypto"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = session.user.businessId
  if (!businessId) return NextResponse.json({ error: "No business" }, { status: 403 })

  const { id } = await params
  const quote = await prisma.quote.findFirst({ where: { id, businessId } })
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const token = quote.shareToken ?? crypto.randomBytes(24).toString("hex")

  const updated = await prisma.quote.update({
    where: { id },
    data: {
      shareToken: token,
      sentAt: quote.sentAt ?? new Date(),
      status: quote.status === "draft" ? "sent" : quote.status,
    },
  })

  const approvalUrl = `${process.env.NEXTAUTH_URL}/q/${token}`
  return NextResponse.json({ approvalUrl, shareToken: token, status: updated.status })
}
