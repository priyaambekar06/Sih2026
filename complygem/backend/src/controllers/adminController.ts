import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Tender from "../models/Tender";
import { logAudit } from "../services/auditLogger";

export async function listUsers(req: Request, res: Response) {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json(users);
}

export async function createUser(req: Request, res: Response) {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "name, email, password and role are required." });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "A user with this email already exists." });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role, department });
  await logAudit(req.user, "CREATE_USER", "User", String(user._id), email);
  const { passwordHash: _omit, ...safe } = user.toObject();
  res.status(201).json(safe);
}

export async function updateUser(req: Request, res: Response) {
  const { name, role, department, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { name, role, department, isActive }, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found." });
  await logAudit(req.user, "UPDATE_USER", "User", String(user._id));
  res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  await logAudit(req.user, "DELETE_USER", "User", req.params.id, user.email);
  res.json({ message: "User removed." });
}

const DEFAULT_WEIGHTS = { pan: 15, gst: 20, udyam: 15, epfo: 10, esic: 10, nsic: 10, mca: 10, blacklist: 10 };

export async function getRuleTemplate(req: Request, res: Response) {
  res.json({
    defaultWeights: DEFAULT_WEIGHTS,
    ocrConfidenceThreshold: 75,
    riskThresholds: { low: 25, medium: 50, high: 75 },
    reverificationCycleDays: 90,
  });
}

export async function updateRuleTemplate(req: Request, res: Response) {
  // Demo stub: in production this persists org-wide defaults consumed by
  // Tender creation and the risk engine. Individual tenders can still
  // override weights per-requirement (see Tender.rules).
  await logAudit(req.user, "UPDATE_RULE_TEMPLATE", "RuleTemplate", undefined, JSON.stringify(req.body));
  res.json({ message: "Rule template updated for new tenders.", ...req.body });
}

export async function getIntegrations(req: Request, res: Response) {
  res.json([
    { name: "AWS Textract", category: "OCR", status: "MOCKED", detail: "Simulated by ai-service/mock_ocr.py — swap in Textract SDK credentials to go live." },
    { name: "PAN (Income Tax)", category: "Verification", status: "MOCKED", detail: "MockPANProvider — replace with NSDL/Protean API." },
    { name: "GST Network (GSTN)", category: "Verification", status: "MOCKED", detail: "MockGSTProvider — replace with GSTN search API." },
    { name: "Udyam Registration", category: "Verification", status: "MOCKED", detail: "MockUdyamProvider." },
    { name: "EPFO", category: "Verification", status: "MOCKED", detail: "MockEPFOProvider." },
    { name: "ESIC", category: "Verification", status: "MOCKED", detail: "MockESICProvider." },
    { name: "NSIC", category: "Verification", status: "MOCKED", detail: "MockNSICProvider." },
    { name: "MCA21", category: "Verification", status: "MOCKED", detail: "MockMCAProvider." },
    { name: "GeM Blacklist", category: "Verification", status: "MOCKED", detail: "MockBlacklistProvider." },
    { name: "SMTP (Nodemailer)", category: "Notifications", status: process.env.SMTP_HOST ? "CONFIGURED" : "NOT CONFIGURED", detail: "Set SMTP_HOST/SMTP_USER/SMTP_PASS in .env." },
  ]);
}
