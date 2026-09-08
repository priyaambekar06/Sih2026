import { Request, Response } from "express";
import Bid from "../models/Bid";
import BidDocument from "../models/Document";

export async function listReports(req: Request, res: Response) {
  const bids = await Bid.find({ status: { $in: ["VERIFIED", "MANUAL_REVIEW", "APPROVED", "APPROVED_WITH_CONDITIONS", "CLARIFICATION_REQUESTED", "REJECTED"] } })
    .populate("bidderId", "companyName")
    .populate("tenderId", "name")
    .sort({ lastVerifiedAt: -1 });
  res.json(bids);
}

export async function getReport(req: Request, res: Response) {
  const bid = await Bid.findById(req.params.id).populate("bidderId").populate("tenderId").populate("decision.decidedBy", "name role");
  if (!bid) return res.status(404).json({ message: "Bid not found." });
  const documents = await BidDocument.find({ bidId: bid._id });
  res.json({
    generatedAt: new Date(),
    bid,
    documents,
    summary: {
      complianceScore: bid.complianceScore,
      riskLevel: bid.riskLevel,
      recommendation: bid.recommendation,
      mismatchCount: bid.mismatches.length,
      decision: bid.decision?.outcome || "PENDING",
    },
  });
}
