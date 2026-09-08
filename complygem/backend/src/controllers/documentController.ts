import { Request, Response } from "express";
import path from "path";
import BidDocument from "../models/Document";
import Bid from "../models/Bid";
import { requestOcr } from "../services/ocrClient";
import { OCR_CONFIDENCE_THRESHOLD } from "../services/ruleEngine";
import { logAudit } from "../services/auditLogger";
import { notifyRole } from "../services/notifier";

export async function listAllDocuments(req: Request, res: Response) {
  const { status, docType, search } = req.query as Record<string, string>;
  const filter: any = {};
  if (status) filter.status = status;
  if (docType) filter.docType = docType;
  if (search) filter.fileName = { $regex: search, $options: "i" };

  const docs = await BidDocument.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(docs);
}

export async function listDocumentsForBid(req: Request, res: Response) {
  const docs = await BidDocument.find({ bidId: req.params.bidId }).sort({ createdAt: 1 });
  res.json(docs);
}

export async function getDocument(req: Request, res: Response) {
  const doc = await BidDocument.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found." });
  res.json(doc);
}

export async function uploadDocument(req: Request, res: Response) {
  const { bidId, docType } = req.body;
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });
  const bid = await Bid.findById(bidId);
  if (!bid) return res.status(404).json({ message: "Bid not found." });

  const doc = await BidDocument.create({
    bidId,
    bidderId: bid.bidderId,
    docType,
    fileName: req.file.originalname,
    filePath: path.relative(path.join(__dirname, "..", ".."), req.file.path),
    mimeType: req.file.mimetype,
    status: "UPLOADED",
    extractedFields: [],
    uploadedBy: req.user!.userId,
  });

  await logAudit(req.user, "UPLOAD_DOCUMENT", "BidDocument", String(doc._id), `${docType} for ${bid.bidRefId}`);

  // Kick off OCR asynchronously so the UI can show a live pipeline animation.
  processOcrPipeline(String(doc._id)).catch((err) => console.error("[ocr pipeline]", err.message));

  res.status(201).json(doc);
}

export async function processOcrPipeline(documentId: string) {
  const doc = await BidDocument.findById(documentId);
  if (!doc) return;
  doc.status = "OCR_PROCESSING";
  await doc.save();

  const result = await requestOcr(documentId, doc.docType, doc.filePath);

  doc.extractedFields = Object.entries(result.fields).map(([key, v]) => ({
    key,
    value: v.value,
    confidence: v.confidence,
  }));
  doc.ocrConfidence = result.confidence;
  doc.status = result.confidence < OCR_CONFIDENCE_THRESHOLD ? "MANUAL_REVIEW" : "OCR_DONE";
  await doc.save();

  if (doc.status === "MANUAL_REVIEW") {
    await notifyRole(
      "REVIEWER",
      "Low OCR confidence",
      `${doc.docType} document (${doc.fileName}) needs manual review — ${result.confidence}% confidence.`,
      "WARNING",
      `/documents/${doc._id}`
    );
  }
}

export async function correctField(req: Request, res: Response) {
  const { fieldKey, newValue } = req.body;
  const doc = await BidDocument.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found." });

  const field = doc.extractedFields.find((f) => f.key === fieldKey);
  if (!field) return res.status(404).json({ message: "Field not found on document." });

  field.value = newValue;
  field.confidence = 100; // officer-corrected, treated as ground truth
  doc.reviewedBy = req.user!.userId as any;
  await doc.save();

  await logAudit(req.user, "CORRECT_FIELD", "BidDocument", String(doc._id), `${fieldKey} -> ${newValue}`);
  res.json(doc);
}

export async function reviewAction(req: Request, res: Response) {
  const { action, remarks } = req.body as { action: "APPROVE" | "REJECT" | "REPROCESS"; remarks?: string };
  const doc = await BidDocument.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found." });

  if (action === "APPROVE") {
    doc.status = "OCR_DONE";
    doc.ocrConfidence = 100;
    doc.reviewedBy = req.user!.userId as any;
    doc.reviewRemarks = remarks;
  } else if (action === "REJECT") {
    doc.status = "FAILED";
    doc.reviewedBy = req.user!.userId as any;
    doc.reviewRemarks = remarks;
  } else if (action === "REPROCESS") {
    await doc.save();
    await processOcrPipeline(String(doc._id));
    await logAudit(req.user, "REPROCESS_DOCUMENT", "BidDocument", String(doc._id));
    return res.json(await BidDocument.findById(doc._id));
  }

  await doc.save();
  await logAudit(req.user, `REVIEW_${action}`, "BidDocument", String(doc._id), remarks);
  res.json(doc);
}
