import { Schema, model, Document as MDocument } from "mongoose";

export interface INotification extends MDocument {
  userId?: Schema.Types.ObjectId;
  role?: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    role: String,
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["INFO", "WARNING", "CRITICAL"], default: "INFO" },
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<INotification>("Notification", NotificationSchema);
