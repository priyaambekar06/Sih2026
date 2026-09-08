import { Request, Response } from "express";
import Tender from "../models/Tender";
import Bid from "../models/Bid";
import { nextTenderId } from "../utils/idGen";
import { logAudit } from "../services/auditLogger";

export async function listTenders(req: Request, res: Response) {
  const { status, department, search } = req.query as Record<string, string>;
  const filter: any = {};
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (search) filter.name = { $regex: search, $options: "i" };

  const tenders = await Tender.find(filter).sort({ createdAt: -1 }).lean();
  const withStats = await Promise.all(
    tenders.map(async (t) => {
      const bids = await Bid.find({ tenderId: t._id });
      const avgCompliance = bids.length
        ? Math.round(bids.reduce((s, b) => s + b.complianceScore, 0) / bids.length)
        : 0;
      return { ...t, bidCount: bids.length, avgCompliance };
    })
  );
  res.json(withStats);
}

export async function getTender(req: Request, res: Response) {
  const tender = await Tender.findById(req.params.id);
  if (!tender) return res.status(404).json({ message: "Tender not found." });
  const bids = await Bid.find({ tenderId: tender._id }).populate("bidderId", "companyName");
  res.json({ tender, bids });
}

export async function createTender(req: Request, res: Response) {
  const { name, department, description, startDate, endDate, rules } = req.body;
  if (!name || !department || !startDate || !endDate) {
    return res.status(400).json({ message: "name, department, startDate and endDate are required." });
  }
  const tender = await Tender.create({
    tenderId: nextTenderId(),
    name,
    department,
    description,
    startDate,
    endDate,
    rules,
    createdBy: req.user!.userId,
  });
  await logAudit(req.user, "CREATE_TENDER", "Tender", String(tender._id), name);
  res.status(201).json(tender);
}

export async function updateTender(req: Request, res: Response) {
  const tender = await Tender.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tender) return res.status(404).json({ message: "Tender not found." });
  await logAudit(req.user, "UPDATE_TENDER", "Tender", String(tender._id));
  res.json(tender);
}

export async function deleteTender(req: Request, res: Response) {
  const tender = await Tender.findByIdAndDelete(req.params.id);
  if (!tender) return res.status(404).json({ message: "Tender not found." });
  await logAudit(req.user, "DELETE_TENDER", "Tender", req.params.id, tender.name);
  res.json({ message: "Tender deleted." });
}
