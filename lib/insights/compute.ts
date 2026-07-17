import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/db"
import { getVertical } from "@/lib/verticals/config"

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function currentPeriod() {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${now.getFullYear()}-Q${q}`
}

export async function computeInsight(businessId: string) {
  const period = currentPeriod()

  const [business, quotes, jobs, invoices] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { vertical: true } }),
    prisma.quote.findMany({ where: { businessId } }),
    prisma.job.findMany({ where: { businessId, status: "completed" } }),
    prisma.invoice.findMany({ where: { job: { businessId }, status: "paid" } }),
  ])

  if (!business) {
    return { quoteCount: 0, jobCount: 0, closeRate: 0, avgJobValue: 0, totalRevenue: 0, estimatedLeakAmount: 0, narrative: null, period, benchmarkCloseRate: 0.6, benchmarkJobValue: 1400, vertical: getVertical("general") }
  }

  const vc = getVertical(business?.vertical ?? "general")

  const sentQuotes = quotes.filter(q => ["sent", "accepted", "declined"].includes(q.status))
  const acceptedQuotes = quotes.filter(q => q.status === "accepted")
  const closeRate = sentQuotes.length > 0 ? acceptedQuotes.length / sentQuotes.length : 0

  const totalRevenue = invoices.reduce((s, i) => s + i.amount, 0)
  const avgJobValue = jobs.length > 0
    ? jobs.reduce((s, j) => s + j.estimatedCost, 0) / jobs.length
    : 0

  const overrunLeak = jobs.reduce((s, j) => {
    const actual = j.actualLaborCost + j.actualMaterialCost
    const overrun = actual - j.estimatedCost
    return s + (overrun > 0 ? overrun : 0)
  }, 0)

  const declinedQuotes = quotes.filter(q => q.status === "declined")
  const lostQuoteValue = declinedQuotes.reduce((s, q) => s + q.totalEstimated * 0.3, 0)

  const draftLeak = quotes
    .filter(q => q.status === "draft")
    .reduce((s, q) => s + q.totalEstimated * 0.15, 0)

  const estimatedLeakAmount = Math.round(overrunLeak + lostQuoteValue + draftLeak)

  const benchmarkCloseRate = vc.benchmarkCloseRate
  const benchmarkJobValue = vc.avgJobValue

  const belowCloseBenchmark = sentQuotes.length > 0 && closeRate < benchmarkCloseRate
  const belowValueBenchmark = avgJobValue > 0 && avgJobValue < benchmarkJobValue

  let narrative: string | null = null
  if (process.env.ANTHROPIC_API_KEY && (jobs.length > 0 || quotes.length > 0)) {
    try {
      const benchmarkContext = [
        belowCloseBenchmark ? `Close rate ${(closeRate * 100).toFixed(0)}% is below the ${vc.displayName} benchmark of ${(benchmarkCloseRate * 100).toFixed(0)}%.` : "",
        belowValueBenchmark ? `Avg job value $${avgJobValue.toFixed(0)} is below the ${vc.displayName} benchmark of $${benchmarkJobValue.toLocaleString()}.` : "",
      ].filter(Boolean).join(" ")

      const prompt = `You are a business analyst for a ${vc.displayName} contractor. Write ONE sentence (max 25 words) of insight. Be specific with amounts. No fluff.

Data:
- Quotes sent: ${sentQuotes.length}, accepted: ${acceptedQuotes.length}, close rate: ${(closeRate * 100).toFixed(0)}% (industry benchmark: ${(benchmarkCloseRate * 100).toFixed(0)}%)
- Completed jobs: ${jobs.length}, avg value: $${avgJobValue.toFixed(0)} (industry benchmark: $${benchmarkJobValue.toLocaleString()})
- Total invoiced (paid): $${totalRevenue.toFixed(0)}
- Estimated total leak: $${estimatedLeakAmount}
${benchmarkContext ? `- Benchmark gaps: ${benchmarkContext}` : ""}

Write the single most actionable insight for this ${vc.displayName} vendor right now.`

      const msg = await getClient().messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 80,
        messages: [{ role: "user", content: prompt }],
      })
      narrative = (msg.content[0] as { type: string; text: string }).text.trim()
    } catch {
      // Silently skip if API key not configured
    }
  }

  await prisma.vendorInsight.upsert({
    where: { businessId_period: { businessId, period } },
    update: { quoteCount: quotes.length, jobCount: jobs.length, closeRate, avgJobValue, totalRevenue, estimatedLeakAmount, narrative },
    create: { businessId, period, quoteCount: quotes.length, jobCount: jobs.length, closeRate, avgJobValue, totalRevenue, estimatedLeakAmount, narrative },
  })

  return { quoteCount: quotes.length, jobCount: jobs.length, closeRate, avgJobValue, totalRevenue, estimatedLeakAmount, narrative, period, benchmarkCloseRate, benchmarkJobValue, vertical: vc }
}
