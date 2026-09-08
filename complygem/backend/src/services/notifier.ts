import Notification from "../models/Notification";

export async function notifyRole(role: string, title: string, message: string, severity: "INFO" | "WARNING" | "CRITICAL", link?: string) {
  await Notification.create({ role, title, message, severity, link });
}

export async function notifyUser(userId: string, title: string, message: string, severity: "INFO" | "WARNING" | "CRITICAL", link?: string) {
  await Notification.create({ userId, title, message, severity, link });
}
