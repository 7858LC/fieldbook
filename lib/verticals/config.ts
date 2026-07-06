export type PainKey = "quotesByGut" | "lateInvoicing" | "noJobCosting" | "clientFollowUp" | "noCrewTracking" | "cashFlowProblems"

export interface VerticalConfig {
  displayName: string
  icon: string
  avgJobValue: number        // industry benchmark in dollars
  benchmarkCloseRate: number // 0–1
  leakRates: Record<PainKey, number>  // fraction of annual revenue
  painLabels: Record<PainKey, string>
  proposalHook: string
}

export const VERTICALS: Record<string, VerticalConfig> = {
  landscaping: {
    displayName: "Landscaping",
    icon: "🌿",
    avgJobValue: 1400,
    benchmarkCloseRate: 0.62,
    leakRates: {
      quotesByGut:      0.08,
      lateInvoicing:    0.06,
      noJobCosting:     0.10,
      clientFollowUp:   0.05,
      noCrewTracking:   0.07,
      cashFlowProblems: 0.04,
    },
    painLabels: {
      quotesByGut:      "Estimates from memory or gut",
      lateInvoicing:    "Invoices sent days/weeks late",
      noJobCosting:     "No tracking of actual vs estimated cost",
      clientFollowUp:   "Manually chasing client approvals",
      noCrewTracking:   "No visibility on crew time in the field",
      cashFlowProblems: "Cash flow problems despite decent revenue",
    },
    proposalHook: "Your crews are busy. Your bank account shouldn't be the last to know.",
  },

  hvac: {
    displayName: "HVAC",
    icon: "❄️",
    avgJobValue: 3200,
    benchmarkCloseRate: 0.58,
    leakRates: {
      quotesByGut:      0.09,
      lateInvoicing:    0.05,
      noJobCosting:     0.11,
      clientFollowUp:   0.06,
      noCrewTracking:   0.08,
      cashFlowProblems: 0.04,
    },
    painLabels: {
      quotesByGut:      "Quoting from memory without parts/labor breakdown",
      lateInvoicing:    "Invoices delayed after service calls",
      noJobCosting:     "No tracking of actual parts and labor vs estimate",
      clientFollowUp:   "Manually following up on unsigned service agreements",
      noCrewTracking:   "No visibility on technician dispatch and time on-site",
      cashFlowProblems: "Cash flow gaps between seasonal peaks",
    },
    proposalHook: "HVAC margins live and die in the details. Most owners don't see the leak until winter.",
  },

  plumbing: {
    displayName: "Plumbing",
    icon: "🔧",
    avgJobValue: 1800,
    benchmarkCloseRate: 0.65,
    leakRates: {
      quotesByGut:      0.07,
      lateInvoicing:    0.06,
      noJobCosting:     0.09,
      clientFollowUp:   0.04,
      noCrewTracking:   0.06,
      cashFlowProblems: 0.05,
    },
    painLabels: {
      quotesByGut:      "Flat-rate quoting without job-specific cost tracking",
      lateInvoicing:    "Invoices issued days after job completion",
      noJobCosting:     "No comparison of quoted vs actual time and materials",
      clientFollowUp:   "Chasing approvals by phone for each job",
      noCrewTracking:   "No digital record of plumber time per job",
      cashFlowProblems: "Irregular cash flow from variable job sizes",
    },
    proposalHook: "Every uncollected invoice and unbilled hour is money that already left your truck.",
  },

  electrical: {
    displayName: "Electrical",
    icon: "⚡",
    avgJobValue: 2400,
    benchmarkCloseRate: 0.60,
    leakRates: {
      quotesByGut:      0.09,
      lateInvoicing:    0.05,
      noJobCosting:     0.10,
      clientFollowUp:   0.05,
      noCrewTracking:   0.07,
      cashFlowProblems: 0.04,
    },
    painLabels: {
      quotesByGut:      "Estimating labor and materials without historical data",
      lateInvoicing:    "Invoices delayed after permit sign-off",
      noJobCosting:     "No tracking of actual electrician hours vs quoted",
      clientFollowUp:   "Chasing signed change orders manually",
      noCrewTracking:   "No visibility on journeyman time per job site",
      cashFlowProblems: "Cash tied up waiting on contractor payment schedules",
    },
    proposalHook: "Electrical work is complex to price. That complexity costs you if you're not tracking it.",
  },

  cleaning: {
    displayName: "Cleaning",
    icon: "🧹",
    avgJobValue: 320,
    benchmarkCloseRate: 0.70,
    leakRates: {
      quotesByGut:      0.06,
      lateInvoicing:    0.07,
      noJobCosting:     0.08,
      clientFollowUp:   0.05,
      noCrewTracking:   0.09,
      cashFlowProblems: 0.03,
    },
    painLabels: {
      quotesByGut:      "Flat-rate pricing without time-based cost tracking",
      lateInvoicing:    "Invoices sent weekly instead of same-day",
      noJobCosting:     "No record of actual cleaning time vs quoted",
      clientFollowUp:   "Manually confirming recurring appointments",
      noCrewTracking:   "No check-in/out records for cleaning teams",
      cashFlowProblems: "High churn from clients who don't pay on time",
    },
    proposalHook: "Cleaning businesses run on volume. Every slow invoice and unbilled hour compounds fast.",
  },

  painting: {
    displayName: "Painting",
    icon: "🎨",
    avgJobValue: 3500,
    benchmarkCloseRate: 0.55,
    leakRates: {
      quotesByGut:      0.10,
      lateInvoicing:    0.06,
      noJobCosting:     0.11,
      clientFollowUp:   0.06,
      noCrewTracking:   0.07,
      cashFlowProblems: 0.05,
    },
    painLabels: {
      quotesByGut:      "Estimating paint and labor from walk-through memory",
      lateInvoicing:    "Final invoice delayed until well after project wrap",
      noJobCosting:     "No tracking of material overage vs estimate",
      clientFollowUp:   "Manually following up on unsigned proposals",
      noCrewTracking:   "No record of painter hours per project",
      cashFlowProblems: "Large material costs paid before client deposit clears",
    },
    proposalHook: "Painting jobs look profitable on paper. The margin disappears in unbilled overruns.",
  },

  roofing: {
    displayName: "Roofing",
    icon: "🏠",
    avgJobValue: 9500,
    benchmarkCloseRate: 0.48,
    leakRates: {
      quotesByGut:      0.08,
      lateInvoicing:    0.05,
      noJobCosting:     0.12,
      clientFollowUp:   0.07,
      noCrewTracking:   0.06,
      cashFlowProblems: 0.05,
    },
    painLabels: {
      quotesByGut:      "Estimating materials and labor from visual inspection only",
      lateInvoicing:    "Final invoice held up by insurance paperwork",
      noJobCosting:     "No tracking of actual shingle/labor cost vs estimate",
      clientFollowUp:   "Chasing signed contracts and insurance supplements manually",
      noCrewTracking:   "No visibility on crew hours per roof section",
      cashFlowProblems: "Long payment cycles from insurance-backed jobs",
    },
    proposalHook: "Roofing margins are thin and the jobs are big. One untracked overrun wipes out your profit.",
  },

  general: {
    displayName: "General Contracting",
    icon: "🏗️",
    avgJobValue: 12000,
    benchmarkCloseRate: 0.45,
    leakRates: {
      quotesByGut:      0.09,
      lateInvoicing:    0.06,
      noJobCosting:     0.12,
      clientFollowUp:   0.06,
      noCrewTracking:   0.07,
      cashFlowProblems: 0.06,
    },
    painLabels: {
      quotesByGut:      "Bidding jobs without detailed cost breakdowns",
      lateInvoicing:    "Progress billing delayed between project phases",
      noJobCosting:     "No tracking of subcontractor and material costs vs bid",
      clientFollowUp:   "Manually managing change order approvals",
      noCrewTracking:   "No visibility on subcontractor time on-site",
      cashFlowProblems: "Cash gaps between draws on large projects",
    },
    proposalHook: "GC work is managed complexity. The contractors who scale are the ones who track everything.",
  },
}

export function getVertical(key: string): VerticalConfig {
  return VERTICALS[key.toLowerCase()] ?? VERTICALS.general
}
