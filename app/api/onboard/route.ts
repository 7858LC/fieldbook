import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  businessName: z.string().min(1),
  vertical: z.string().min(1),
})

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

async function uniqueSlug(base: string) {
  let slug = slugify(base)
  let i = 0
  while (await prisma.business.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${++i}`
  }
  return slug
}

export async function POST(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.businessId) return NextResponse.json({ error: "Already onboarded" }, { status: 409 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { businessName, vertical } = parsed.data
  const slug = await uniqueSlug(businessName)

  const business = await prisma.business.create({
    data: { name: businessName, slug, vertical },
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { businessId: business.id, role: "OWNER" },
  })

  return NextResponse.json({ ok: true })
}
