import { Request, Response } from "express";
import Bidder from "../models/Bidder";
import Bid from "../models/Bid";

export async function listBidders(req: Request, res: Response) {
  const bidders = await Bidder.find().sort({ createdAt: -1 }).lean();
  const withStats = await Promise.all(
    bidders.map(async (b) => {
      const bids = await Bid.find({ bidderId: b._id }).sort({ createdAt: -1 });
      const latest = bids[0];
      return {
        ...b,
        bidCount: bids.length,
        latestCompliance: latest?.complianceScore ?? null,
        latestRisk: latest?.riskLevel ?? null,
      };
    })
  );
  res.json(withStats);
}

export async function getBidder(req: Request, res: Response) {
  const bidder = await Bidder.findById(req.params.id);
  if (!bidder) return res.status(404).json({ message: "Bidder not found." });
  const bids = await Bid.find({ bidderId: bidder._id }).populate("tenderId", "name tenderId").sort({ createdAt: -1 });
  res.json({ bidder, bids });
}
