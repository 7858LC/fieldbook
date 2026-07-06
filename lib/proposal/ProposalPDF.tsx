import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import type { ProposalInput, ProposalContent } from "./types"

// Use built-in fonts — no external font fetch required
const GREEN  = "#15803d"
const DARK   = "#111827"
const GRAY   = "#6b7280"
const LGRAY  = "#f3f4f6"
const ORANGE = "#ea580c"
const WHITE  = "#ffffff"

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: WHITE, padding: 0 },

  // Cover
  cover: { backgroundColor: GREEN, padding: 56, minHeight: "100%", justifyContent: "space-between" },
  coverEyebrow: { color: "#86efac", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 48 },
  coverTitle: { color: WHITE, fontSize: 36, fontFamily: "Helvetica-Bold", lineHeight: 1.2, marginBottom: 16 },
  coverSub: { color: "#bbf7d0", fontSize: 14, lineHeight: 1.5 },
  coverFooter: { color: "#86efac", fontSize: 9, marginTop: 48 },
  coverAmount: { color: WHITE, fontSize: 56, fontFamily: "Helvetica-Bold", marginTop: 32, marginBottom: 4 },
  coverAmountLabel: { color: "#86efac", fontSize: 11 },

  // Body pages
  body: { padding: 48 },
  pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  pageHeaderBrand: { color: GREEN, fontSize: 11, fontFamily: "Helvetica-Bold" },
  pageHeaderBiz: { color: GRAY, fontSize: 9 },

  section: { marginBottom: 28 },
  sectionLabel: { color: GREEN, fontSize: 8, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "Helvetica-Bold" },
  body1: { color: DARK, fontSize: 11, lineHeight: 1.7 },
  body2: { color: GRAY, fontSize: 10, lineHeight: 1.6 },

  // Leak table
  leakRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  leakLeft: { flex: 1, paddingRight: 16 },
  leakLabel: { color: DARK, fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  leakExplain: { color: GRAY, fontSize: 9, lineHeight: 1.5 },
  leakAmount: { color: ORANGE, fontSize: 13, fontFamily: "Helvetica-Bold", minWidth: 80, textAlign: "right" },

  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: LGRAY, padding: 14, borderRadius: 6, marginTop: 12 },
  totalLabel: { color: DARK, fontSize: 11, fontFamily: "Helvetica-Bold" },
  totalAmount: { color: ORANGE, fontSize: 20, fontFamily: "Helvetica-Bold" },

  // Offer box
  offerBox: { backgroundColor: GREEN, borderRadius: 8, padding: 24, marginTop: 8 },
  offerTitle: { color: WHITE, fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  offerBody: { color: "#bbf7d0", fontSize: 10, lineHeight: 1.7 },

  // Guarantee box
  guaranteeBox: { borderWidth: 1, borderColor: "#d1fae5", borderRadius: 6, padding: 16, marginTop: 16 },
  guaranteeTitle: { color: GREEN, fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  guaranteeBody: { color: GRAY, fontSize: 9, lineHeight: 1.6 },

  // Next steps
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  stepNum: { backgroundColor: GREEN, color: WHITE, fontSize: 9, fontFamily: "Helvetica-Bold", width: 20, height: 20, borderRadius: 10, textAlign: "center", paddingTop: 4, marginRight: 12, flexShrink: 0 },
  stepText: { color: DARK, fontSize: 10, lineHeight: 1.6, flex: 1 },

  footer: { position: "absolute", bottom: 28, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { color: "#d1d5db", fontSize: 8 },
})

function PageHeader({ businessName }: { businessName: string }) {
  return (
    <View style={s.pageHeader}>
      <Text style={s.pageHeaderBrand}>FieldBook · UzimzAmka</Text>
      <Text style={s.pageHeaderBiz}>{businessName} — Confidential</Text>
    </View>
  )
}

export function buildProposalDocument(input: ProposalInput, content: ProposalContent) {
  return <ProposalPDF input={input} content={content} />
}

export function ProposalPDF({ input, content }: { input: ProposalInput; content: ProposalContent }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  return (
    <Document title={`Profit Leak Analysis — ${input.businessName}`}>

      {/* PAGE 1 — COVER */}
      <Page size="LETTER" style={s.page}>
        <View style={s.cover}>
          <View>
            <Text style={s.coverEyebrow}>FieldBook by UzimzAmka · Confidential</Text>
            <Text style={s.coverTitle}>Profit Leak{"\n"}Analysis</Text>
            <Text style={s.coverSub}>{input.businessName}{"\n"}{input.vendorName} · {date}</Text>
          </View>
          <View>
            <Text style={s.coverAmountLabel}>Estimated annual profit leak</Text>
            <Text style={s.coverAmount}>${content.totalEstimatedLeak.toLocaleString()}</Text>
            <Text style={s.coverSub}>Based on {input.estimatedAnnualRevenue.toLocaleString()} in revenue{"\n"}and {Object.values(input.pains).filter(Boolean).length} identified friction points.</Text>
          </View>
          <Text style={s.coverFooter}>Prepared exclusively for {input.businessName} · Not for distribution</Text>
        </View>
      </Page>

      {/* PAGE 2 — EXECUTIVE SUMMARY + DIAGNOSIS */}
      <Page size="LETTER" style={s.page}>
        <View style={s.body}>
          <PageHeader businessName={input.businessName} />

          <View style={s.section}>
            <Text style={s.sectionLabel}>Executive Summary</Text>
            <Text style={s.body1}>{content.executiveSummary}</Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>The Diagnosis</Text>
            <Text style={s.body1}>{content.diagnosisNarrative}</Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Business Profile</Text>
            <View style={{ flexDirection: "row", gap: 24, marginTop: 4 }}>
              {[
                ["Trade", input.vertical],
                ["Annual Revenue", `$${input.estimatedAnnualRevenue.toLocaleString()}`],
                ["Years Operating", String(input.yearsInBusiness)],
                ["Crew Size", String(input.crewSize)],
              ].map(([label, value]) => (
                <View key={label} style={{ flex: 1, backgroundColor: LGRAY, padding: 12, borderRadius: 6 }}>
                  <Text style={{ color: GRAY, fontSize: 8, marginBottom: 4 }}>{label}</Text>
                  <Text style={{ color: DARK, fontSize: 12, fontFamily: "Helvetica-Bold" }}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>FieldBook Profit Leak Analysis · {input.businessName}</Text>
          <Text style={s.footerText}>Page 2</Text>
        </View>
      </Page>

      {/* PAGE 3 — LEAK BREAKDOWN */}
      <Page size="LETTER" style={s.page}>
        <View style={s.body}>
          <PageHeader businessName={input.businessName} />

          <View style={s.section}>
            <Text style={s.sectionLabel}>Where the Money Goes</Text>
            <Text style={[s.body2, { marginBottom: 16 }]}>
              Each line below represents a pattern identified in your operation. Dollar amounts are calculated
              from industry benchmarks applied to your revenue profile.
            </Text>

            {content.leakBreakdown.map((item, i) => (
              <View key={i} style={s.leakRow}>
                <View style={s.leakLeft}>
                  <Text style={s.leakLabel}>{item.label}</Text>
                  <Text style={s.leakExplain}>{item.explanation}</Text>
                </View>
                <Text style={s.leakAmount}>${item.estimatedAmount.toLocaleString()}</Text>
              </View>
            ))}

            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Estimated Total Annual Leak</Text>
              <Text style={s.totalAmount}>${content.totalEstimatedLeak.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>FieldBook Profit Leak Analysis · {input.businessName}</Text>
          <Text style={s.footerText}>Page 3</Text>
        </View>
      </Page>

      {/* PAGE 4 — THE FIX + THE OFFER */}
      <Page size="LETTER" style={s.page}>
        <View style={s.body}>
          <PageHeader businessName={input.businessName} />

          <View style={s.section}>
            <Text style={s.sectionLabel}>What Changes</Text>
            <Text style={s.body1}>{content.fixNarrative}</Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>The Offer</Text>
            <View style={s.offerBox}>
              <Text style={s.offerTitle}>90-Day FieldBook Trial — Done With You</Text>
              <Text style={s.offerBody}>{content.offerNarrative}</Text>
            </View>

            <View style={s.guaranteeBox}>
              <Text style={s.guaranteeTitle}>The Guarantee</Text>
              <Text style={s.guaranteeBody}>
                Run FieldBook on 5 jobs. If you haven&apos;t recovered the cost of your first month in recovered
                margin or paid invoices, we refund everything. No questions.
              </Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Next Steps</Text>
            {[
              "We build your first quote together — you describe a job you have right now, we build it in FieldBook in 10 minutes.",
              "You send the client a professional approval link. They approve it from their phone. You get notified.",
              "After 5 jobs, we review your numbers together. Then we talk about LeadFlow.",
            ].map((text, i) => (
              <View key={i} style={s.stepRow}>
                <Text style={s.stepNum}>{i + 1}</Text>
                <Text style={s.stepText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>FieldBook Profit Leak Analysis · {input.businessName}</Text>
          <Text style={s.footerText}>Page 4</Text>
        </View>
      </Page>

    </Document>
  )
}
