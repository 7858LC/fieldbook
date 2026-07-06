import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession } from "@/lib/session"
import { z } from "zod"

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }),
  z.object({
    action: z.literal("complete"),
    actualLaborCost: z.number().min(0),
    actualMaterialCost: z.number().min(0),
  }),
  z.object({
    action: z.literal("checkin"),
    crewMemberId: z.string().cuid(),
  }),
])

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

  const job = await prisma.job.findFirst({ where: { id, businessId } })
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const data = parsed.data

  if (data.action === "start") {
    await prisma.job.update({ where: { id }, data: { status: "in_progress", startedAt: new Date() } })
  } else if (data.action === "complete") {
    await prisma.job.update({
      where: { id },
      data: {
        status: "completed",
        completedAt: new Date(),
        actualLaborCost: data.actualLaborCost,
        actualMaterialCost: data.actualMaterialCost,
      },
    })
  } else if (data.action === "checkin") {
    const crew = await prisma.crewMember.findFirst({ where: { id: data.crewMemberId, businessId } })
    if (!crew) return NextResponse.json({ error: "Crew member not found" }, { status: 404 })
    await prisma.crewCheckIn.create({ data: { jobId: id, crewMemberId: data.crewMemberId } })
  }

  return NextResponse.json({ ok: true })
}
