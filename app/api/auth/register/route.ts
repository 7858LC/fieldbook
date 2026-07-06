import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(100),
  businessName: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

async function uniqueSlug(base: string) {
  let slug = slugify(base)
  let n = 0
  while (await prisma.business.findUnique({ where: { slug } })) {
    n++
    slug = `${slugify(base)}-${n}`
  }
  return slug
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { name, businessName, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 10)
  const slug = await uniqueSlug(businessName)

  // Create Business + OWNER User atomically
  const business = await prisma.business.create({
    data: {
      name: businessName,
      slug,
      users: {
        create: { name, email, password: hash, role: "OWNER" },
      },
    },
    include: { users: true },
  })

  return NextResponse.json({ ok: true, businessId: business.id })
}
