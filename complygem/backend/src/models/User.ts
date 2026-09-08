import { Schema, model, Document as MDocument } from "mongoose";

export type UserRole = "ADMIN" | "PROCUREMENT_OFFICER" | "REVIEWER";

export interface IUser extends MDocument {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "PROCUREMENT_OFFICER", "REVIEWER"],
      required: true,
    },
    department: { type: String, default: "General Procurement" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IUser>("User", UserSchema);
