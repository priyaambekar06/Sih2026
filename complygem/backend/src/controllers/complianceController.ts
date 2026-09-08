import { Request, Response } from "express";
import Bid, { IRequirementResult } from "../models/Bid";
import Bidder from "../models/Bidder";
import BidDocument from "../models/Document";

function edgeStatus(results: IRequirementResult[], keys: string[]): "MATCH" | "MISMATCH" | "PENDING" {
  const relevant = results.filter((r) => keys.includes(r.key));
  if (relevant.some((r) => r.status === "PENDING")) return "PENDING";
  if (relevant.every((r) => r.status === "PASS")) return "MATCH";
  return "MISMATCH";
}

export async function getComplianceReport(req: Request, res: Response) {
  const bid = await Bid.findById(req.params.bidId).populate("bidderId").populate("tenderId");
  if (!bid) return res.status(404).json({ message: "Bid not found." });
  const documents = await BidDocument.find({ bidId: bid._id });

  const r = bid.requirementResults;
  const relationshipMap = {
    nodes: ["PAN", "GST", "UDYAM", "MCA", "EPFO", "ESIC"],
    edges: [
      { from: "PAN", to: "GST", status: edgeStatus(r, ["pan", "gst"]) },
      { from: "GST", to: "UDYAM", status: edgeStatus(r, ["gst", "udyam"]) },
      { from: "GST", to: "MCA", status: edgeStatus(r, ["gst", "mca"]) },
      { from: "UDYAM", to: "EPFO", status: edgeStatus(r, ["udyam", "epfo"]) },
      { from: "UDYAM", to: "ESIC", status: edgeStatus(r, ["udyam", "esic"]) },
    ],
  };

  res.json({ bid, documents, relationshipMap });
}
