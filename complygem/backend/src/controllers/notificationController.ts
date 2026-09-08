import { Request, Response } from "express";
import Notification from "../models/Notification";

export async function listNotifications(req: Request, res: Response) {
  const notifications = await Notification.find({
    $or: [{ userId: req.user!.userId }, { role: req.user!.role }, { userId: { $exists: false }, role: { $exists: false } }],
  })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
}

export async function markRead(req: Request, res: Response) {
  const n = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  res.json(n);
}

export async function markAllRead(req: Request, res: Response) {
  await Notification.updateMany({ role: req.user!.role }, { isRead: true });
  res.json({ message: "All notifications marked as read." });
}
