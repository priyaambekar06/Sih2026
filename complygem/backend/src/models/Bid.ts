import { Schema, model, Document as MDocument } from "mongoose";

export type BidStatus =
  | "SUBMITTED"
  | "PROCESSING"
  | "VERIFIED"
  | "MANUAL_REVIEW"
  | "APPROVED"
  | "APPROVED_WITH_CONDITIONS"
  | "CLARIFICATION_REQUESTED"
  | "REJECTED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface IRequirementResult {
  key: string; // pan, gst, udyam, epfo, esic, nsic, mca, blacklist
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

export interface IMismatch {
  title: string;
  submitted: string;
  verified: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
  recommendation: string;
}

export interface IRiskFactor {
  label: string;
  points: number;
  reason: string;
}

export interface IDecision {
  outcome: "APPROVED" | "APPROVED_WITH_CONDITIONS" | "CLARIFICATION_REQUESTED" | "REJECTED";
  remarks: string;
  decidedBy: Schema.Types.ObjectId;
  decidedAt: Date;
}

export interface IBid extends MDocument {
  bidRefId: string; // e.g. GEM/2026/B/1023
  tenderId: Schema.Types.ObjectId;
  bidderId: Schema.Types.ObjectId;
  submittedAt: Date;
  status: BidStatus;
  scenarioTag?: string;
  complianceScore: number;
  requirementResults: IRequirementResult[];
  mismatches: IMismatch[];
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: IRiskFactor[];
  recommendation: "COMPLIANT" | "CONDITIONALLY_COMPLIANT" | "REQUIRES_REVIEW" | "NON_COMPLIANT";
  decision?: IDecision;
  lastVerifiedAt?: Date;
  nextVerificationDue?: Date;
  createdAt: Date;
}

const ReqResultSchema = new Schema<IRequirementResult>(
  {
    key: String,
    label: String,
    required: Boolean,
    status: { type: String, enum: ["PASS", "WARNING", "FAIL", "PENDING"] },
    scoreAwarded: Number,
    maxScore: Number,
    submittedValue: String,
    verifiedValue: String,
    source: String,
    confidence: Number,
    reason: String,
  },
  { _id: false }
);

const MismatchSchema = new Schema<IMismatch>(
  {
    title: String,
    submitted: String,
    verified: String,
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    explanation: String,
    recommendation: String,
  },
  { _id: false }
);

const RiskFactorSchema = new Schema<IRiskFactor>(
  { label: String, points: Number, reason: String },
  { _id: false }
);

const DecisionSchema = new Schema<IDecision>(
  {
    outcome: {
      type: String,
      enum: ["APPROVED", "APPROVED_WITH_CONDITIONS", "CLARIFICATION_REQUESTED", "REJECTED"],
    },
    remarks: String,
    decidedBy: { type: Schema.Types.ObjectId, ref: "User" },
    decidedAt: Date,
  },
  { _id: false }
);

const BidSchema = new Schema<IBid>(
  {
    bidRefId: { type: String, required: true, unique: true },
    tenderId: { type: Schema.Types.ObjectId, ref: "Tender", required: true },
    bidderId: { type: Schema.Types.ObjectId, ref: "Bidder", required: true },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "PROCESSING",
        "VERIFIED",
        "MANUAL_REVIEW",
        "APPROVED",
        "APPROVED_WITH_CONDITIONS",
        "CLARIFICATION_REQUESTED",
        "REJECTED",
      ],
      default: "SUBMITTED",
    },
    scenarioTag: String,
    complianceScore: { type: Number, default: 0 },
    requirementResults: [ReqResultSchema],
    mismatches: [MismatchSchema],
    riskScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "LOW" },
    riskFactors: [RiskFactorSchema],
    recommendation: {
      type: String,
      enum: ["COMPLIANT", "CONDITIONALLY_COMPLIANT", "REQUIRES_REVIEW", "NON_COMPLIANT"],
      default: "REQUIRES_REVIEW",
    },
    decision: DecisionSchema,
    lastVerifiedAt: Date,
    nextVerificationDue: Date,
  },
  { timestamps: true }
);

export default model<IBid>("Bid", BidSchema);
