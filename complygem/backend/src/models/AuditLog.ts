import { Schema, model, Document as MDocument } from "mongoose";

export interface IAuditLog extends MDocument {
  actorId?: Schema.Types.ObjectId;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorName: String,
    actorRole: String,
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: String,
    details: String,
  },
  { timestamps: true }
);

export default model<IAuditLog>("AuditLog", AuditLogSchema);
