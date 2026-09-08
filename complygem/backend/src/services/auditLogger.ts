import AuditLog from "../models/AuditLog";
import { TokenPayload } from "../utils/jwt";

export async function logAudit(
  actor: TokenPayload | undefined,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) {
  await AuditLog.create({
    actorId: actor?.userId,
    actorName: actor?.name || "System",
    actorRole: actor?.role || "SYSTEM",
    action,
    entityType,
    entityId,
    details,
  });
}
