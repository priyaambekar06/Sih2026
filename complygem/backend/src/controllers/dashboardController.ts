import { Request, Response } from "express";
import Tender from "../models/Tender";
import Bid from "../models/Bid";
import BidDocument from "../models/Document";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getDashboard(req: Request, res: Response) {
  const [totalTenders, allBids, allDocs] = await Promise.all([
    Tender.countDocuments(),
    Bid.find(),
    BidDocument.find(),
  ]);

  const activeBids = allBids.filter((b) => !["APPROVED", "REJECTED"].includes(b.status)).length;
  const pendingReview = allBids.filter((b) => b.status === "MANUAL_REVIEW").length;
  const highRisk = allBids.filter((b) => b.riskLevel === "HIGH" || b.riskLevel === "CRITICAL").length;
  const today = startOfDay(new Date());
  const verifiedToday = allBids.filter((b) => b.lastVerifiedAt && new Date(b.lastVerifiedAt) >= today).length;
  const avgCompliance = allBids.length
    ? Math.round(allBids.reduce((s, b) => s + (b.complianceScore || 0), 0) / allBids.length)
    : 0;

  // Compliance overview — last 7 days
  const last7: { date: string; avgScore: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayBids = allBids.filter((b) => b.lastVerifiedAt && new Date(b.lastVerifiedAt) >= dayStart && new Date(b.lastVerifiedAt) < dayEnd);
    const avg = dayBids.length ? Math.round(dayBids.reduce((s, b) => s + b.complianceScore, 0) / dayBids.length) : avgCompliance;
    last7.push({ date: dayStart.toISOString().slice(0, 10), avgScore: avg });
  }

  const riskDistribution = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((level) => ({
    level,
    count: allBids.filter((b) => b.riskLevel === level).length,
  }));

  const verificationStatus = [
    { status: "Verified", count: allBids.filter((b) => ["VERIFIED", "APPROVED", "APPROVED_WITH_CONDITIONS"].includes(b.status)).length },
    { status: "Pending", count: allBids.filter((b) => ["SUBMITTED", "PROCESSING"].includes(b.status)).length },
    { status: "Failed", count: allBids.filter((b) => b.status === "REJECTED").length },
    { status: "Manual Review", count: allBids.filter((b) => b.status === "MANUAL_REVIEW").length },
  ];

  const documentProcessing = [
    { status: "Processed", count: allDocs.filter((d) => ["VERIFIED", "MISMATCH", "OCR_DONE"].includes(d.status)).length },
    { status: "Pending", count: allDocs.filter((d) => ["UPLOADED", "OCR_PROCESSING"].includes(d.status)).length },
    { status: "Failed", count: allDocs.filter((d) => d.status === "FAILED").length },
  ];

  const priorityBids = await Bid.find({ $or: [{ riskLevel: { $in: ["HIGH", "CRITICAL"] } }, { status: "MANUAL_REVIEW" }] })
    .populate("bidderId", "companyName")
    .sort({ riskScore: -1 })
    .limit(6);

  const recentBids = await Bid.find()
    .populate("bidderId", "companyName")
    .populate("tenderId", "name")
    .sort({ createdAt: -1 })
    .limit(8);

  res.json({
    cards: {
      totalTenders,
      activeBids,
      pendingReview,
      highRisk,
      verifiedToday,
      avgCompliance,
    },
    charts: { complianceOverview: last7, riskDistribution, verificationStatus, documentProcessing },
    priorityBids,
    recentBids,
  });
}
