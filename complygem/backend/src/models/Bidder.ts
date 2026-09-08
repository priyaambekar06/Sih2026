import { Schema, model, Document as MDocument } from "mongoose";

export interface IBidder extends MDocument {
  companyName: string;
  legalNameMCA?: string;
  pan?: string;
  gstin?: string;
  udyamNumber?: string;
  cin?: string;
  epfoNumber?: string;
  esicNumber?: string;
  nsicNumber?: string;
  isBlacklisted: boolean;
  lastVerifiedAt?: Date;
  nextVerificationDue?: Date;
  createdAt: Date;
}

const BidderSchema = new Schema<IBidder>(
  {
    companyName: { type: String, required: true },
    legalNameMCA: String,
    pan: String,
    gstin: String,
    udyamNumber: String,
    cin: String,
    epfoNumber: String,
    esicNumber: String,
    nsicNumber: String,
    isBlacklisted: { type: Boolean, default: false },
    lastVerifiedAt: Date,
    nextVerificationDue: Date,
  },
  { timestamps: true }
);

export default model<IBidder>("Bidder", BidderSchema);
