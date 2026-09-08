import { Schema, model, Document as MDocument } from "mongoose";

export interface IRequirementRule {
  required: boolean;
  activeRequired?: boolean;
  weight: number;
}

export interface ITenderRules {
  pan: IRequirementRule;
  gst: IRequirementRule;
  udyam: IRequirementRule;
  epfo: IRequirementRule;
  esic: IRequirementRule;
  nsic: IRequirementRule;
  mca: IRequirementRule;
  blacklist: IRequirementRule;
}

export interface ITender extends MDocument {
  tenderId: string;
  name: string;
  department: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: "DRAFT" | "OPEN" | "CLOSED" | "AWARDED";
  rules: ITenderRules;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
}

const RuleSchema = new Schema<IRequirementRule>(
  {
    required: { type: Boolean, default: true },
    activeRequired: { type: Boolean, default: false },
    weight: { type: Number, default: 10 },
  },
  { _id: false }
);

const TenderSchema = new Schema<ITender>(
  {
    tenderId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "OPEN", "CLOSED", "AWARDED"],
      default: "OPEN",
    },
    rules: {
      pan: { type: RuleSchema, default: () => ({ required: true, weight: 15 }) },
      gst: { type: RuleSchema, default: () => ({ required: true, activeRequired: true, weight: 20 }) },
      udyam: { type: RuleSchema, default: () => ({ required: true, weight: 15 }) },
      epfo: { type: RuleSchema, default: () => ({ required: true, weight: 10 }) },
      esic: { type: RuleSchema, default: () => ({ required: true, weight: 10 }) },
      nsic: { type: RuleSchema, default: () => ({ required: false, weight: 10 }) },
      mca: { type: RuleSchema, default: () => ({ required: true, weight: 10 }) },
      blacklist: { type: RuleSchema, default: () => ({ required: true, weight: 10 }) },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default model<ITender>("Tender", TenderSchema);
