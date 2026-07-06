import Anthropic from "@anthropic-ai/sdk"
import type { ProposalInput, ProposalContent } from "./types"
import { getVertical } from "@/lib/verticals/config"

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function buildLeakBreakdown(input: ProposalInput) {
  const vc = getVertical(input.vertical)

  const breakdown = Object.entries(input.pains)
    .filter(([, active]) => active)
    .map(([key]) => ({
      label: vc.painLabels[key as keyof typeof vc.painLabels],
      estimatedAmount: Math.round(vc.leakRates[key as keyof typeof vc.leakRates] * input.estimatedAnnualRevenue),
      explanation: LEAK_EXPLANATIONS[key] ?? "",
    }))

  const total = breakdown.reduce((s, b) => s + b.estimatedAmount, 0)
  return { breakdown, total }
}

export async function generateProposalContent(input: ProposalInput): Promise<ProposalContent> {
  const vc = getVertical(input.vertical)
  const { breakdown, total } = await buildLeakBreakdown(input)

  const activePains = Object.entries(input.pains)
    .filter(([, v]) => v)
    .map(([k]) => vc.painLabels[k as keyof typeof vc.painLabels])
    .join(", ")

  const prompt = `You are writing a profit leak analysis proposal for a ${vc.displayName} contractor. Be direct, specific, and credible. No fluff. Use dollar amounts. Use trade-appropriate language for ${vc.displayName} (e.g. "${Object.values(vc.painLabels)[4]}" not generic "crew tracking").

VENDOR PROFILE:
- Owner: ${input.vendorName}
- Business: ${input.businessName}
- Trade: ${vc.displayName}
- Estimated annual revenue: $${input.estimatedAnnualRevenue.toLocaleString()}
- Industry benchmark avg job value: $${vc.avgJobValue.toLocaleString()}
- Industry benchmark close rate: ${(vc.benchmarkCloseRate * 100).toFixed(0)}%
- Years in business: ${input.yearsInBusiness}
- Crew/team size: ${input.crewSize}
- Identified pain points: ${activePains || "general operational friction"}
- Estimated annual profit leak: $${total.toLocaleString()}

Write four short sections. Return ONLY a JSON object with these exact keys:

{
  "executiveSummary": "2-3 sentences. Lead with the dollar leak. Name the business. Make it feel like you already know their operation.",
  "diagnosisNarrative": "3-4 sentences. Describe how ${vc.displayName} contractors in their revenue range lose money through the exact pain points identified. Specific and credible — cite the patterns, not the software.",
  "fixNarrative": "2-3 sentences. Explain what changes when every job has a digital approval trail, real cost tracking, and invoices go out within 24 hours. Concrete outcomes for a ${vc.displayName} business, not generic features.",
  "offerNarrative": "2-3 sentences. Describe the offer: 90-day trial, done-with-you first quote, money-back if they don't recover the cost on 5 jobs. Make it low-risk and specific."
}`

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const raw = (message.content[0] as { type: string; text: string }).text
  const jsonStr = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim()
  const generated = JSON.parse(jsonStr)

  return {
    executiveSummary: generated.executiveSummary,
    diagnosisNarrative: generated.diagnosisNarrative,
    leakBreakdown: breakdown,
    totalEstimatedLeak: total,
    fixNarrative: generated.fixNarrative,
    offerNarrative: generated.offerNarrative,
  }
}

const LEAK_EXPLANATIONS: Record<string, string> = {
  quotesByGut:      "Without job cost history, quotes are often 8–12% below true cost. That gap comes straight out of margin.",
  lateInvoicing:    "Every day between job completion and invoice is a collection risk. Industry data shows 6% of revenue evaporates in late-invoice scenarios.",
  noJobCosting:     "When actual labor and material costs aren't tracked per job, overruns are invisible until the bank account tells you.",
  clientFollowUp:   "Quotes sent without a digital approval trail are forgotten. Contractors lose roughly 1 in 20 jobs purely from no follow-up mechanism.",
  noCrewTracking:   "Without field check-ins, time rounds down — to the hour, the half-day. That time is labor cost with no revenue attached.",
  cashFlowProblems: "Cash-thin businesses take bad jobs at bad prices to keep the trucks moving. That reactive pricing erodes margin over time.",
}
