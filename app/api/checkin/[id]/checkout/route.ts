export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.crewCheckIn.update({ where: { id }, data: { checkOutAt: new Date() } })
  return NextResponse.redirect(new URL("/jobs", _req.url))
}
