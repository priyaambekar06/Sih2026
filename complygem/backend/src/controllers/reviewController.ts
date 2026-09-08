import { Request, Response } from "express";
import BidDocument from "../models/Document";
import Bid from "../models/Bid";

export async function getReviewQueue(req: Request, res: Response) {
  const { filter } = req.query as { filter?: string };

  const statusFilter: any = { status: { $in: ["MANUAL_REVIEW", "MISMATCH", "FAILED"] } };
  const docs = await BidDocument.find(statusFilter).sort({ createdAt: -1 }).lean();

  const items = await Promise.all(
    docs.map(async (d) => {
      const bid = await Bid.findById(d.bidId).lean();
      return {
        documentId: d._id,
        bidId: d.bidId,
        bidRefId: bid?.bidRefId,
        docType: d.docType,
        fileName: d.fileName,
        issue:
          d.status === "MANUAL_REVIEW"
            ? "Low OCR confidence"
            : d.status === "MISMATCH"
            ? d.verificationResult?.reason || "Verification mismatch"
            : "Extraction failed",
        confidence: d.ocrConfidence,
        risk: bid?.riskLevel || "LOW",
        age: d.createdAt,
        status: d.status,
        assignedTo: d.reviewedBy ? "Assigned" : "Unassigned",
      };
    })
  );

  let filtered = items;
  if (filter === "high-risk") filtered = items.filter((i) => i.risk === "HIGH" || i.risk === "CRITICAL");
  if (filter === "low-confidence") filtered = items.filter((i) => (i.confidence ?? 100) < 75);
  if (filter === "mismatch") filtered = items.filter((i) => i.status === "MISMATCH");
  if (filter === "missing") filtered = items.filter((i) => i.status === "FAILED");

  res.json(filtered);
}

export async function getReviewItem(req: Request, res: Response) {
  const doc = await BidDocument.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found." });
  const bid = await Bid.findById(doc.bidId).populate("bidderId", "companyName").populate("tenderId", "name");
  res.json({ document: doc, bid });
}
