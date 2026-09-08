import Bid, { IMismatch, IRequirementResult } from "../models/Bid";
import BidDocument, { DocType, IBidDocument } from "../models/Document";
import Tender, { ITenderRules } from "../models/Tender";
import Bidder from "../models/Bidder";
import { verificationProvider } from "./verificationAdapters";
import {
  evaluateRequirement,
  buildMismatch,
  computeComplianceScore,
  deriveRecommendation,
  OCR_CONFIDENCE_THRESHOLD,
} from "./ruleEngine";
import { computeRisk } from "./riskEngine";
import { logAudit } from "./auditLogger";
import { notifyRole } from "./notifier";
import { TokenPayload } from "../utils/jwt";

const REQUIREMENT_LABELS: Record<keyof ITenderRules, string> = {
  pan: "PAN",
  gst: "GST",
  udyam: "Udyam/MSME",
  epfo: "EPFO",
  esic: "ESIC",
  nsic: "NSIC",
  mca: "MCA21",
  blacklist: "Blacklist Check",
};

function field(doc: IBidDocument | undefined, key: string): string | undefined {
  return doc?.extractedFields.find((f) => f.key === key)?.value;
}

const SIMPLE_REQS: { key: "gst" | "udyam" | "epfo" | "esic" | "nsic"; docType: DocType; fieldKey: string; verify: (value: string, pan: string) => Promise<any> }[] = [
  { key: "gst", docType: "GST", fieldKey: "gstin", verify: (v, p) => verificationProvider.verifyGST(v, p) },
  { key: "udyam", docType: "UDYAM", fieldKey: "udyamNumber", verify: (v, p) => verificationProvider.verifyUdyam(v, p) },
  { key: "epfo", docType: "EPFO", fieldKey: "epfoNumber", verify: (v, p) => verificationProvider.verifyEPFO(v, p) },
  { key: "esic", docType: "ESIC", fieldKey: "esicNumber", verify: (v, p) => verificationProvider.verifyESIC(v, p) },
  { key: "nsic", docType: "NSIC", fieldKey: "nsicNumber", verify: (v, p) => verificationProvider.verifyNSIC(v, p) },
];

/**
 * Orchestrates the full DOCUMENTS -> VERIFICATION -> RULE ENGINE -> SCORE
 * pipeline for one bid. OCR/extraction is assumed to have already populated
 * each BidDocument.extractedFields (see documentController.uploadDocument).
 */
export async function runVerification(bidId: string, actor?: TokenPayload) {
  const bid = await Bid.findById(bidId);
  if (!bid) throw Object.assign(new Error("Bid not found"), { status: 404 });
  const tender = await Tender.findById(bid.tenderId);
  if (!tender) throw Object.assign(new Error("Tender not found"), { status: 404 });
  const bidder = await Bidder.findById(bid.bidderId);
  if (!bidder) throw Object.assign(new Error("Bidder not found"), { status: 404 });

  bid.status = "PROCESSING";
  await bid.save();

  const documents = await BidDocument.find({ bidId: bid._id });
  const docByType: Partial<Record<DocType, IBidDocument>> = {};
  documents.forEach((d) => (docByType[d.docType] = d));

  const panDoc = docByType["PAN"];
  const submittedPan = field(panDoc, "panNumber") || bidder.pan || "";
  const submittedLegalName = field(panDoc, "legalName") || bidder.companyName;

  const results: IRequirementResult[] = [];
  const mismatches: IMismatch[] = [];

  // ---- PAN ----
  {
    const rule = tender.rules.pan;
    const present = !!panDoc;
    let matched: boolean | undefined, verifiedValue: string | undefined, source: string | undefined, reason: string | undefined;
    if (present) {
      const out = await verificationProvider.verifyPAN(submittedPan, submittedLegalName);
      matched = out.matched;
      verifiedValue = out.verifiedValue;
      source = out.source;
      reason = out.reason;
      panDoc!.verificationResult = { matched, source: source!, reason };
      panDoc!.status = !matched ? "MISMATCH" : (panDoc!.ocrConfidence ?? 100) < OCR_CONFIDENCE_THRESHOLD ? "MANUAL_REVIEW" : "VERIFIED";
      await panDoc!.save();
    }
    const result = evaluateRequirement({
      key: "pan", label: REQUIREMENT_LABELS.pan, rule, present,
      submittedValue: submittedPan, verifiedValue, matched, source, confidence: panDoc?.ocrConfidence, reason,
    });
    results.push(result);
    if (present && matched === false) {
      mismatches.push(
        buildMismatch(
          "PAN Holder Mismatch",
          submittedLegalName,
          verifiedValue || "Not found",
          reason?.toLowerCase().includes("differs") ? "HIGH" : "MEDIUM",
          reason || "PAN holder details could not be confirmed.",
          "Officer review recommended before final decision."
        )
      );
    }
  }

  // ---- GST / Udyam / EPFO / ESIC / NSIC ----
  for (const cfg of SIMPLE_REQS) {
    const doc = docByType[cfg.docType];
    const rule = tender.rules[cfg.key];
    const present = !!doc;
    let matched: boolean | undefined, verifiedValue: string | undefined, source: string | undefined, reason: string | undefined;
    const submittedValue = field(doc, cfg.fieldKey);

    if (present && submittedValue && submittedPan) {
      const out = await cfg.verify(submittedValue, submittedPan);
      matched = out.matched;
      verifiedValue = out.verifiedValue;
      source = out.source;
      reason = out.reason;
      doc!.verificationResult = { matched, source: source!, reason };
      doc!.status = !matched ? "MISMATCH" : (doc!.ocrConfidence ?? 100) < OCR_CONFIDENCE_THRESHOLD ? "MANUAL_REVIEW" : "VERIFIED";
      await doc!.save();
    }

    const result = evaluateRequirement({
      key: cfg.key, label: REQUIREMENT_LABELS[cfg.key], rule, present,
      submittedValue, verifiedValue, matched, source, confidence: doc?.ocrConfidence, reason,
    });
    results.push(result);

    if (present && matched === false) {
      const severity: IMismatch["severity"] =
        reason?.toLowerCase().includes("inactive") || reason?.toLowerCase().includes("expired")
          ? "CRITICAL"
          : reason?.toLowerCase().includes("not found")
          ? "HIGH"
          : "MEDIUM";
      mismatches.push(
        buildMismatch(
          `${REQUIREMENT_LABELS[cfg.key]} Status Mismatch`,
          submittedValue || "Not submitted",
          verifiedValue || "Not found",
          severity,
          reason || `${REQUIREMENT_LABELS[cfg.key]} could not be verified against the source system.`,
          severity === "CRITICAL"
            ? "Do not auto-reject. Verify current status before final decision."
            : "Officer review recommended."
        )
      );
    }
  }

  // ---- MCA21 ----
  {
    const doc = docByType["MCA"];
    const rule = tender.rules.mca;
    const present = !!doc;
    const submittedValue = field(doc, "companyName") || submittedLegalName;
    let matched: boolean | undefined, verifiedValue: string | undefined, source: string | undefined, reason: string | undefined;
    if (present && submittedPan) {
      const out = await verificationProvider.verifyMCA(submittedValue, submittedPan);
      matched = out.matched;
      verifiedValue = out.verifiedValue;
      source = out.source;
      reason = out.reason;
      doc!.verificationResult = { matched, source: source!, reason };
      doc!.status = !matched ? "MISMATCH" : (doc!.ocrConfidence ?? 100) < OCR_CONFIDENCE_THRESHOLD ? "MANUAL_REVIEW" : "VERIFIED";
      await doc!.save();
    }
    const result = evaluateRequirement({
      key: "mca", label: REQUIREMENT_LABELS.mca, rule, present,
      submittedValue, verifiedValue, matched, source, confidence: doc?.ocrConfidence, reason,
    });
    results.push(result);
    if (present && matched === false) {
      mismatches.push(
        buildMismatch(
          "Company Name Mismatch",
          submittedValue,
          verifiedValue || "Not found",
          reason?.toLowerCase().includes("materially") ? "HIGH" : "MEDIUM",
          reason?.toLowerCase().includes("materially")
            ? "Entity names differ substantially and may indicate a different legal entity."
            : "Entity names differ slightly but may represent the same legal entity.",
          "Officer review recommended."
        )
      );
    }
  }

  // ---- Blacklist ----
  {
    const rule = tender.rules.blacklist;
    const out = await verificationProvider.checkBlacklist(submittedPan, submittedLegalName);
    const result = evaluateRequirement({
      key: "blacklist", label: REQUIREMENT_LABELS.blacklist, rule, present: true,
      submittedValue: "N/A", verifiedValue: out.verifiedValue, matched: out.matched, source: out.source, reason: out.reason,
    });
    results.push(result);
    if (!out.matched) {
      mismatches.push(
        buildMismatch(
          "Blacklist Match Found",
          submittedLegalName,
          out.verifiedValue || "Match found",
          "CRITICAL",
          out.reason || "Bidder appears on a restricted vendor list.",
          "Officer review mandatory. Do not approve without escalation."
        )
      );
    }
    bidder.isBlacklisted = !out.matched;
  }

  const complianceScore = computeComplianceScore(results);
  const hasCriticalMismatch = mismatches.some((m) => m.severity === "CRITICAL");
  const hasFail = results.some((r) => r.status === "FAIL" && r.required);
  const recommendation = deriveRecommendation(complianceScore, hasCriticalMismatch, hasFail);
  const { riskScore, riskLevel, riskFactors } = computeRisk(results, mismatches, bidder.isBlacklisted);

  const needsManualReview = results.some((r) => r.confidence !== undefined && r.confidence < OCR_CONFIDENCE_THRESHOLD);

  bid.requirementResults = results;
  bid.mismatches = mismatches;
  bid.complianceScore = complianceScore;
  bid.riskScore = riskScore;
  bid.riskLevel = riskLevel;
  bid.riskFactors = riskFactors;
  bid.recommendation = recommendation;
  bid.status = needsManualReview ? "MANUAL_REVIEW" : "VERIFIED";
  bid.lastVerifiedAt = new Date();
  bid.nextVerificationDue = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  await bid.save();

  bidder.lastVerifiedAt = new Date();
  bidder.nextVerificationDue = bid.nextVerificationDue;
  await bidder.save();

  await logAudit(actor, "RUN_VERIFICATION", "Bid", String(bid._id), `Compliance ${complianceScore}, Risk ${riskLevel}`);

  if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
    await notifyRole("PROCUREMENT_OFFICER", `High risk bid: ${bid.bidRefId}`, `${bid.bidRefId} scored ${complianceScore}/100 with ${riskLevel} risk.`, "CRITICAL", `/bids/${bid._id}`);
  }
  if (needsManualReview) {
    await notifyRole("REVIEWER", `Manual review required: ${bid.bidRefId}`, `One or more documents in ${bid.bidRefId} need manual OCR review.`, "WARNING", `/review`);
  }

  return bid;
}
