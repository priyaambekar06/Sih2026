import { Schema, model, Document as MDocument } from "mongoose";

export type DocType = "PAN" | "GST" | "UDYAM" | "EPFO" | "ESIC" | "NSIC" | "MCA" | "OTHER";
export type DocStatus =
  | "UPLOADED"
  | "OCR_PROCESSING"
  | "OCR_DONE"
  | "VERIFIED"
  | "MISMATCH"
  | "MANUAL_REVIEW"
  | "FAILED";

export interface IExtractedField {
  key: string;
  value: string;
  confidence: number;
}

export interface IBidDocument extends MDocument {
  bidId: Schema.Types.ObjectId;
  bidderId: Schema.Types.ObjectId;
  docType: DocType;
  fileName: string;
  filePath: string;
  mimeType: string;
  status: DocStatus;
  ocrConfidence?: number;
  extractedFields: IExtractedField[];
  verificationResult?: {
    matched: boolean;
    source: string;
    reason?: string;
  };
  uploadedBy: Schema.Types.ObjectId;
  reviewedBy?: Schema.Types.ObjectId;
  reviewRemarks?: string;
  createdAt: Date;
}

const FieldSchema = new Schema<IExtractedField>(
  { key: String, value: String, confidence: Number },
  { _id: false }
);

const BidDocumentSchema = new Schema<IBidDocument>(
  {
    bidId: { type: Schema.Types.ObjectId, ref: "Bid", required: true },
    bidderId: { type: Schema.Types.ObjectId, ref: "Bidder", required: true },
    docType: {
      type: String,
      enum: ["PAN", "GST", "UDYAM", "EPFO", "ESIC", "NSIC", "MCA", "OTHER"],
      required: true,
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, default: "application/pdf" },
    status: {
      type: String,
      enum: ["UPLOADED", "OCR_PROCESSING", "OCR_DONE", "VERIFIED", "MISMATCH", "MANUAL_REVIEW", "FAILED"],
      default: "UPLOADED",
    },
    ocrConfidence: Number,
    extractedFields: [FieldSchema],
    verificationResult: {
      matched: Boolean,
      source: String,
      reason: String,
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewRemarks: String,
  },
  { timestamps: true }
);

export default model<IBidDocument>("BidDocument", BidDocumentSchema);
