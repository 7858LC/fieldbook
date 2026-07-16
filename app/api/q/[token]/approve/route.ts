export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  const { name, email } = parsed.success ? parsed.data : {}

  const quote = await prisma.quote.findUnique({ where: { shareToken: token } })
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (quote.status === "accepted") {
    return NextResponse.json({ status: "accepted" })
  }

  if (!["sent", "draft"].includes(quote.status)) {
    return NextResponse.json({ error: "Quote cannot be approved in its current state" }, { status: 409 })
  }

  // Capture homeowner into UzimzAmka network if email provided
  if (email) {
    await prisma.homeowner.upsert({
      where: { email },
      update: { name: name ?? undefined },
      create: { email, name, source: "quote_approval" },
    })
  }

  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: "accepted" },
  })

  return NextResponse.json({ status: "accepted" })
}
