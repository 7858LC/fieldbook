export interface ProposalInput {
  // Vendor info
  vendorName: string         // owner name
  businessName: string       // business name
  vertical: string           // landscaping | pressure_washing | pest_control | etc
  estimatedAnnualRevenue: number
  yearsInBusiness: number
  crewSize: number

  // Observed pain points (checkboxes on the form)
  pains: {
    quotesByGut: boolean       // estimating from memory
    lateInvoicing: boolean     // invoices sent days/weeks after job
    noJobCosting: boolean      // no tracking of actual vs estimated
    clientFollowUp: boolean    // manually chasing approvals
    noCrewTracking: boolean    // no visibility on field time
    cashFlowProblems: boolean  // revenue exists but cash is thin
  }
}

export interface ProposalContent {
  executiveSummary: string
  diagnosisNarrative: string
  leakBreakdown: {
    label: string
    estimatedAmount: number
    explanation: string
  }[]
  totalEstimatedLeak: number
  fixNarrative: string
  offerNarrative: string
}
