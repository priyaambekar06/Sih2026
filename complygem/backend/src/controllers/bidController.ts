import { Request, Response } from "express";
import Bid from "../models/Bid";
import Bidder from "../models/Bidder";
import Tender from "../models/Tender";
import BidDocument from "../models/Document";
import { nextBidRefId } from "../utils/idGen";
import { runVerification } from "../services/complianceService";
import { logAudit } from "../services/auditLogger";
import { notifyRole } from "../services/notifier";

export async function listBids(req: Request, res: Response) {
  const { status, risk, tenderId } = req.query as Record<string, string>;
  const filter: any = {};
  if (status) filter.status = status;
  if (risk) filter.riskLevel = risk;
  if (tenderId) filter.tenderId = tenderId;

  const bids = await Bid.find(filter)
    .populate("bidderId", "companyName pan gstin")
    .populate("tenderId", "name tenderId")
    .sort({ createdAt: -1 });
  res.json(bids);
}

export async function getBid(req: Request, res: Response) {
  const bid = await Bid.findById(req.params.id)
    .populate("bidderId")
    .populate("tenderId")
    .populate("decision.decidedBy", "name role");
  if (!bid) return res.status(404).json({ message: "Bid not found." });
  const documents = await BidDocument.find({ bidId: bid._id });
  res.json({ bid, documents });
}

export async function createBid(req: Request, res: Response) {
  const { tenderId, bidderId, scenarioTag } = req.body;
  const tender = await Tender.findById(tenderId);
  const bidder = await Bidder.findById(bidderId);
  if (!tender || !bidder) return res.status(404).json({ message: "Tender or bidder not found." });

  const bid = await Bid.create({
    bidRefId: nextBidRefId(),
    tenderId,
    bidderId,
    scenarioTag,
    status: "SUBMITTED",
  });
  await logAudit(req.user, "CREATE_BID", "Bid", String(bid._id), bid.bidRefId);
  res.status(201).json(bid);
}

export async function startVerification(req: Request, res: Response) {
  const bid = await runVerification(req.params.id, req.user);
  res.json(bid);
}

export async function reverifyBid(req: Request, res: Response) {
  const bid = await runVerification(req.params.id, req.user);
  await logAudit(req.user, "REVERIFY_BID", "Bid", String(bid._id));
  res.json(bid);
}

export async function decideBid(req: Request, res: Response) {
  const { outcome, remarks } = req.body;
  if (!outcome || !remarks) {
    return res.status(400).json({ message: "Decision outcome and remarks are required." });
  }
  const bid = await Bid.findById(req.params.id);
  if (!bid) return res.status(404).json({ message: "Bid not found." });

  bid.decision = {
    outcome,
    remarks,
    decidedBy: req.user!.userId as any,
    decidedAt: new Date(),
  };
  bid.status = outcome;
  await bid.save();

  await logAudit(req.user, "DECIDE_BID", "Bid", String(bid._id), `${outcome}: ${remarks}`);
  await notifyRole(
    "ADMIN",
    `Decision recorded: ${bid.bidRefId}`,
    `${req.user!.name} marked ${bid.bidRefId} as ${outcome.replace(/_/g, " ")}.`,
    "INFO",
    `/bids/${bid._id}`
  );

  res.json(bid);
}
