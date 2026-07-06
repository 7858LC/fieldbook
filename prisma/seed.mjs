import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { randomBytes } from "crypto"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, "../dev.db")
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

// Simple bcrypt-compatible hash using node built-ins isn't available,
// so we store a known bcrypt hash for "password123"
// Generated: bcrypt.hashSync("password123", 10)
const PASSWORD_HASH = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"

function tok() { return randomBytes(24).toString("hex") }

async function main() {
  console.log("Seeding...")

  await prisma.vendorInsight.deleteMany()
  await prisma.serviceHistory.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.referral.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.crewCheckIn.deleteMany()
  await prisma.crewMember.deleteMany()
  await prisma.job.deleteMany()
  await prisma.lineItem.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.serviceTemplate.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.homeowner.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
  await prisma.business.deleteMany()

  const business = await prisma.business.create({
    data: { name: "Green Turf Landscaping", slug: "green-turf", vertical: "landscaping", phone: "555-310-4400", email: "marcus@greenturf.com", plan: "fieldbook" },
  })

  await prisma.user.create({
    data: { businessId: business.id, name: "Marcus Green", email: "marcus@greenturf.com", password: PASSWORD_HASH, role: "OWNER" },
  })

  const [tmow, tmulch, thedge, tirr, tsod] = await Promise.all([
    prisma.serviceTemplate.create({ data: { businessId: business.id, name: "Lawn Mowing", unit: "visit", defaultLaborRate: 80, defaultMaterialCost: 5 } }),
    prisma.serviceTemplate.create({ data: { businessId: business.id, name: "Mulch Installation", unit: "yard", defaultLaborRate: 45, defaultMaterialCost: 38 } }),
    prisma.serviceTemplate.create({ data: { businessId: business.id, name: "Hedge Trimming", unit: "hour", defaultLaborRate: 65, defaultMaterialCost: 0 } }),
    prisma.serviceTemplate.create({ data: { businessId: business.id, name: "Irrigation Check", unit: "flat", defaultLaborRate: 120, defaultMaterialCost: 25 } }),
    prisma.serviceTemplate.create({ data: { businessId: business.id, name: "Sod Installation", unit: "sq ft", defaultLaborRate: 1.2, defaultMaterialCost: 0.85 } }),
  ])

  const [c1, c2, c3, c4, c5] = await Promise.all([
    prisma.customer.create({ data: { businessId: business.id, name: "Jennifer Walsh", phone: "555-201-3344", email: "jwalsh@gmail.com", address: "142 Oak Lane" } }),
    prisma.customer.create({ data: { businessId: business.id, name: "Robert Hendricks", phone: "555-408-7722", email: "rhendricks@email.com", address: "88 Birchwood Dr" } }),
    prisma.customer.create({ data: { businessId: business.id, name: "Carla Nguyen", phone: "555-312-9900", email: "carla.n@mail.com", address: "29 Sunset Blvd" } }),
    prisma.customer.create({ data: { businessId: business.id, name: "Tom Becker", phone: "555-619-5500", address: "317 Maple Ave" } }),
    prisma.customer.create({ data: { businessId: business.id, name: "Sandra Ortiz", phone: "555-720-1188", email: "sortiz@gmail.com", address: "54 River Rd" } }),
  ])

  // Quote 1 — paid
  const q1 = await prisma.quote.create({ data: { businessId: business.id, customerId: c1.id, status: "accepted", totalEstimated: 1250, shareToken: tok(), sentAt: new Date("2026-06-01"),
    lineItems: { create: [
      { name: "Lawn Mowing", unit: "visit", quantity: 8, laborRate: 80, materialCost: 5, total: 680, serviceTemplateId: tmow.id },
      { name: "Hedge Trimming", unit: "hour", quantity: 4, laborRate: 65, materialCost: 0, total: 260, serviceTemplateId: thedge.id },
      { name: "Irrigation Check", unit: "flat", quantity: 1, laborRate: 120, materialCost: 25, total: 145, serviceTemplateId: tirr.id },
      { name: "Mulch (3 yards)", unit: "yard", quantity: 3, laborRate: 45, materialCost: 38, total: 165, serviceTemplateId: tmulch.id },
    ]}
  }})
  const j1 = await prisma.job.create({ data: { businessId: business.id, customerId: c1.id, quoteId: q1.id, status: "completed", scheduledDate: new Date("2026-06-05"), completedAt: new Date("2026-06-05"), estimatedCost: 1250, actualLaborCost: 980, actualMaterialCost: 320 } })
  await prisma.invoice.create({ data: { jobId: j1.id, amount: 1250, status: "paid", paidAt: new Date("2026-06-08"), shareToken: tok() } })

  // Quote 2 — paid
  const q2 = await prisma.quote.create({ data: { businessId: business.id, customerId: c2.id, status: "accepted", totalEstimated: 2800, shareToken: tok(), sentAt: new Date("2026-06-10"),
    lineItems: { create: [
      { name: "Sod Installation", unit: "sq ft", quantity: 1200, laborRate: 1.2, materialCost: 0.85, total: 2460, serviceTemplateId: tsod.id },
      { name: "Lawn Mowing", unit: "visit", quantity: 2, laborRate: 80, materialCost: 5, total: 170, serviceTemplateId: tmow.id },
      { name: "Irrigation Check", unit: "flat", quantity: 1, laborRate: 120, materialCost: 25, total: 145, serviceTemplateId: tirr.id },
    ]}
  }})
  const j2 = await prisma.job.create({ data: { businessId: business.id, customerId: c2.id, quoteId: q2.id, status: "completed", scheduledDate: new Date("2026-06-15"), completedAt: new Date("2026-06-16"), estimatedCost: 2800, actualLaborCost: 1500, actualMaterialCost: 1100, notes: "Extra sod overran materials by $180" } })
  await prisma.invoice.create({ data: { jobId: j2.id, amount: 2800, status: "paid", paidAt: new Date("2026-06-20"), shareToken: tok() } })

  // Quote 3 — awaiting approval (demo LeadFlow quote)
  const demoToken = "demo-quote-token-fieldbook-leadflow"
  await prisma.quote.create({ data: { businessId: business.id, customerId: c3.id, status: "sent", totalEstimated: 1850, shareToken: demoToken, sentAt: new Date("2026-07-01"),
    notes: "Spring cleanup + seasonal mulch refresh. Please approve to schedule.",
    lineItems: { create: [
      { name: "Spring Cleanup", unit: "flat", quantity: 1, laborRate: 320, materialCost: 0, total: 320 },
      { name: "Mulch Installation", unit: "yard", quantity: 8, laborRate: 45, materialCost: 38, total: 664, serviceTemplateId: tmulch.id },
      { name: "Lawn Mowing", unit: "visit", quantity: 10, laborRate: 80, materialCost: 5, total: 850, serviceTemplateId: tmow.id },
    ]}
  }})

  // Quote 4 — declined
  const q4 = await prisma.quote.create({ data: { businessId: business.id, customerId: c4.id, status: "declined", totalEstimated: 3400, shareToken: tok(), sentAt: new Date("2026-06-20"),
    lineItems: { create: [
      { name: "Full Landscape Redesign", unit: "flat", quantity: 1, laborRate: 2200, materialCost: 800, total: 3000 },
      { name: "Irrigation Install", unit: "flat", quantity: 1, laborRate: 320, materialCost: 80, total: 400 },
    ]}
  }})
  const j4 = await prisma.job.create({ data: { businessId: business.id, customerId: c4.id, quoteId: q4.id, status: "cancelled", scheduledDate: new Date("2026-06-28"), estimatedCost: 3400, actualLaborCost: 0, actualMaterialCost: 0 } })

  // Quote 5 — draft
  await prisma.quote.create({ data: { businessId: business.id, customerId: c5.id, status: "draft", totalEstimated: 920,
    lineItems: { create: [
      { name: "Hedge Trimming", unit: "hour", quantity: 6, laborRate: 65, materialCost: 0, total: 390, serviceTemplateId: thedge.id },
      { name: "Lawn Mowing", unit: "visit", quantity: 6, laborRate: 80, materialCost: 5, total: 510, serviceTemplateId: tmow.id },
    ]}
  }})

  // Quote 6 — in progress, unpaid invoice
  const q6 = await prisma.quote.create({ data: { businessId: business.id, customerId: c5.id, status: "accepted", totalEstimated: 1680, shareToken: tok(), sentAt: new Date("2026-07-02"),
    lineItems: { create: [
      { name: "Sod Installation", unit: "sq ft", quantity: 800, laborRate: 1.2, materialCost: 0.85, total: 1640, serviceTemplateId: tsod.id },
      { name: "Lawn Mowing", unit: "visit", quantity: 1, laborRate: 80, materialCost: 5, total: 40, serviceTemplateId: tmow.id },
    ]}
  }})
  const j6 = await prisma.job.create({ data: { businessId: business.id, customerId: c5.id, quoteId: q6.id, status: "in_progress", scheduledDate: new Date("2026-07-05"), estimatedCost: 1680, actualLaborCost: 0, actualMaterialCost: 0 } })
  await prisma.invoice.create({ data: { jobId: j6.id, amount: 1680, status: "unpaid", shareToken: tok() } })

  // Homeowner captured from quote approval (LeadFlow asset)
  const homeowner = await prisma.homeowner.create({
    data: { email: "carla.n@mail.com", name: "Carla Nguyen", phone: "555-312-9900", zipCode: "90210", source: "quote_approval" },
  })

  await prisma.lead.create({
    data: { businessId: business.id, homeownerId: homeowner.id, status: "quoted", serviceType: "landscaping", description: "Seasonal mulch and mowing package", zipCode: "90210", exclusive: true, source: "leadflow" },
  })

  console.log("")
  console.log("✓ Business:   Green Turf Landscaping")
  console.log("✓ Login:      marcus@greenturf.com / password123")
  console.log("✓ Quotes:     6 (2 paid, 1 pending approval, 1 declined, 1 draft, 1 in-progress)")
  console.log("✓ LeadFlow:   1 lead linked to homeowner Carla Nguyen")
  console.log("")
  console.log("Demo quote (Powered by LeadFlow footer):")
  console.log("  http://localhost:3001/q/" + demoToken)
  console.log("")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
