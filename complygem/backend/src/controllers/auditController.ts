import { Request, Response } from "express";
import AuditLog from "../models/AuditLog";

export async function listAuditLogs(req: Request, res: Response) {
  const { entityType, action, page = "1", limit = "50" } = req.query as Record<string, string>;
  const filter: any = {};
  if (entityType) filter.entityType = entityType;
  if (action) filter.action = action;

  const p = parseInt(page, 10);
  const l = parseInt(limit, 10);

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
    AuditLog.countDocuments(filter),
  ]);

  res.json({ logs, total, page: p, pages: Math.ceil(total / l) });
}
