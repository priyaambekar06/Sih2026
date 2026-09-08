export type Role = "ADMIN" | "PROCUREMENT_OFFICER" | "REVIEWER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Recommendation = "COMPLIANT" | "CONDITIONALLY_COMPLIANT" | "REQUIRES_REVIEW" | "NON_COMPLIANT";
export type BidStatus =
  | "SUBMITTED" | "PROCESSING" | "VERIFIED" | "MANUAL_REVIEW"
  | "APPROVED" | "APPROVED_WITH_CONDITIONS" | "CLARIFICATION_REQUESTED" | "REJECTED";

export interface RequirementResult {
  key: string;
  label: string;
  required: boolean;
  status: "PASS" | "WARNING" | "FAIL" | "PENDING";
  scoreAwarded: number;
  maxScore: number;
  submittedValue?: string;
  verifiedValue?: string;
  source?: string;
  confidence?: number;
  reason?: string;
}

export interface Mismatch {
  title: string;
  submitted: string;
  verified: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
  recommendation: string;
}

export interface RiskFactor {
  label: string;
  points: number;
  reason: string;
}

export interface Bidder {
  _id: string;
  companyName: string;
  legalNameMCA?: string;
  pan?: string;
  gstin?: string;
  udyamNumber?: string;
  cin?: string;
  isBlacklisted?: boolean;
  lastVerifiedAt?: string;
  nextVerificationDue?: string;
  bidCount?: number;
  latestCompliance?: number | null;
  latestRisk?: RiskLevel | null;
}

export interface Tender {
  _id: string;
  tenderId: string;
  name: string;
  department: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "OPEN" | "CLOSED" | "AWARDED";
  rules: Record<string, { required: boolean; activeRequired?: boolean; weight: number }>;
  bidCount?: number;
  avgCompliance?: number;
}

export interface Bid {
  _id: string;
  bidRefId: string;
  tenderId: Tender | string;
  bidderId: Bidder | string;
  submittedAt: string;
  status: BidStatus;
  scenarioTag?: string;
  complianceScore: number;
  requirementResults: RequirementResult[];
  mismatches: Mismatch[];
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  recommendation: Recommendation;
  decision?: { outcome: string; remarks: string; decidedAt: string; decidedBy?: { name: string; role: string } };
  lastVerifiedAt?: string;
  nextVerificationDue?: string;
  createdAt: string;
}

export interface ExtractedField {
  key: string;
  value: string;
  confidence: number;
}

export interface BidDocument {
  _id: string;
  bidId: string;
  bidderId: string;
  docType: "PAN" | "GST" | "UDYAM" | "EPFO" | "ESIC" | "NSIC" | "MCA" | "OTHER";
  fileName: string;
  filePath: string;
  mimeType: string;
  status: "UPLOADED" | "OCR_PROCESSING" | "OCR_DONE" | "VERIFIED" | "MISMATCH" | "MANUAL_REVIEW" | "FAILED";
  ocrConfidence?: number;
  extractedFields: ExtractedField[];
  verificationResult?: { matched: boolean; source: string; reason?: string };
  reviewRemarks?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  link?: string;
  isRead: boolean;
  createdAt: string;
}
