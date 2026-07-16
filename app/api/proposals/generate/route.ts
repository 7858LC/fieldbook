export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { z } from "zod"
import { generateProposalContent } from "@/lib/proposal/generate"
import { buildProposalDocument } from "@/lib/proposal/ProposalPDF"

const schema = z.object({
  vendorName: z.string().min(1).max(100),
  businessName: z.string().min(1).max(200),
  vertical: z.string().min(1).max(100),
  estimatedAnnualRevenue: z.number().positive().max(50_000_000),
  yearsInBusiness: z.number().int().min(0).max(100),
  crewSize: z.number().int().min(1).max(500),
  pains: z.object({
    quotesByGut: z.boolean(),
    lateInvoicing: z.boolean(),
    noJobCosting: z.boolean(),
    clientFollowUp: z.boolean(),
    noCrewTracking: z.boolean(),
    cashFlowProblems: z.boolean(),
  }),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const input = parsed.data

  // Generate AI narrative
  const content = await generateProposalContent(input)

  // Render PDF to buffer
  const buffer = await renderToBuffer(buildProposalDocument(input, content))

  const slug = input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="FieldBook-Proposal-${slug}.pdf"`,
    },
  })
}

