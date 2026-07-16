export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession } from "@/lib/session"
import { z } from "zod"

const schema = z.object({ jobId: z.string().cuid() })

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

  const job = await prisma.job.findFirst({
    where: { id: parsed.data.jobId, businessId },
    include: { invoice: true },
  })
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })
  if (job.invoice) return NextResponse.json({ id: job.invoice.id })

  const invoice = await prisma.invoice.create({
    data: { jobId: job.id, amount: job.estimatedCost, status: "unpaid" },
  })

  return NextResponse.json({ id: invoice.id })
}

