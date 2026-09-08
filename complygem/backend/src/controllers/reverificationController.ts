import { Request, Response } from "express";
import Bidder from "../models/Bidder";
import Bid from "../models/Bid";
import { runVerification } from "../services/complianceService";

export async function listReverificationQueue(req: Request, res: Response) {
  const bidders = await Bidder.find().sort({ nextVerificationDue: 1 }).lean();
  const now = new Date();
  const withDue = await Promise.all(
    bidders.map(async (b) => {
      const latestBid = await Bid.findOne({ bidderId: b._id }).sort({ createdAt: -1 });
      return {
        bidderId: b._id,
        companyName: b.companyName,
        lastVerifiedAt: b.lastVerifiedAt,
        nextVerificationDue: b.nextVerificationDue,
        isOverdue: b.nextVerificationDue ? new Date(b.nextVerificationDue) < now : false,
        latestBidId: latestBid?._id,
        latestBidRefId: latestBid?.bidRefId,
        riskLevel: latestBid?.riskLevel || "LOW",
      };
    })
  );
  res.json(withDue);
}

export async function triggerReverification(req: Request, res: Response) {
  const bidder = await Bidder.findById(req.params.bidderId);
  if (!bidder) return res.status(404).json({ message: "Bidder not found." });
  const latestBid = await Bid.findOne({ bidderId: bidder._id }).sort({ createdAt: -1 });
  if (!latestBid) return res.status(404).json({ message: "No bid found for this bidder to reverify." });
  const bid = await runVerification(String(latestBid._id), req.user);
  res.json(bid);
}

export async function scheduleReverification(req: Request, res: Response) {
  const { dueDate } = req.body;
  const bidder = await Bidder.findByIdAndUpdate(req.params.bidderId, { nextVerificationDue: dueDate }, { new: true });
  if (!bidder) return res.status(404).json({ message: "Bidder not found." });
  res.json(bidder);
}
