import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";

import User from "../models/User";
import Tender from "../models/Tender";
import Bidder from "../models/Bidder";
import Bid from "../models/Bid";
import BidDocument from "../models/Document";
import AuditLog from "../models/AuditLog";
import Notification from "../models/Notification";
import { scenarios } from "./scenarios";
import { runVerification } from "../services/complianceService";
import { nextBidRefId, nextTenderId } from "../utils/idGen";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const RULE_DEFAULTS = {
  pan: { required: true, weight: 15 },
  gst: { required: true, activeRequired: true, weight: 20 },
  udyam: { required: true, weight: 15 },
  epfo: { required: true, weight: 10 },
  esic: { required: true, weight: 10 },
  nsic: { required: false, weight: 10 },
  mca: { required: true, weight: 10 },
  blacklist: { required: true, weight: 10 },
};

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/complygem";
  await mongoose.connect(uri);
  console.log(`[seed] connected -> ${uri}`);

  console.log("[seed] clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Tender.deleteMany({}),
    Bidder.deleteMany({}),
    Bid.deleteMany({}),
    BidDocument.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log("[seed] creating demo users...");
  const passwordHash = await bcrypt.hash("Demo@123", 10);
  const [officer, reviewer, admin] = await Promise.all([
    User.create({ name: "Ananya Sharma", email: "officer@complygem.demo", passwordHash, role: "PROCUREMENT_OFFICER", department: "Central Procurement Cell" }),
    User.create({ name: "Rohit Verma", email: "reviewer@complygem.demo", passwordHash, role: "REVIEWER", department: "Compliance Review Desk" }),
    User.create({ name: "Meera Iyer", email: "admin@complygem.demo", passwordHash, role: "ADMIN", department: "System Administration" }),
  ]);

  console.log("[seed] creating tenders...");
  const tenderDefs = [
    {
      name: "IT Hardware & Networking Equipment Supply 2026",
      department: "Ministry of Electronics & Information Technology",
      description: "Procurement of laptops, servers and networking equipment for e-Governance data centres.",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-10-31"),
      rules: RULE_DEFAULTS,
    },
    {
      name: "National Highway Maintenance Equipment Tender",
      department: "Ministry of Road Transport & Highways",
      description: "Supply of road maintenance machinery, requires NSIC certification for MSME preference.",
      startDate: new Date("2026-06-15"),
      endDate: new Date("2026-11-30"),
      rules: { ...RULE_DEFAULTS, nsic: { required: true, weight: 10 } },
    },
    {
      name: "Medical Supplies & PPE Procurement",
      department: "Ministry of Health & Family Welfare",
      description: "Procurement of hospital-grade PPE kits, diagnostic consumables and medical devices.",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-12-15"),
      rules: RULE_DEFAULTS,
    },
  ];

  const tenders = [];
  for (const t of tenderDefs) {
    tenders.push(await Tender.create({ ...t, tenderId: nextTenderId(), status: "OPEN", createdBy: officer._id }));
  }

  console.log("[seed] creating bidders, bids and documents from 10 demo scenarios...");
  for (const scenario of scenarios) {
    const bidder = await Bidder.create({
      companyName: scenario.submittedCompanyName,
      pan: scenario.pan,
    });

    const bid = await Bid.create({
      bidRefId: nextBidRefId(),
      tenderId: tenders[scenario.tenderIndex]._id,
      bidderId: bidder._id,
      scenarioTag: `Scenario ${scenario.id}: ${scenario.title}`,
      status: "SUBMITTED",
    });

    for (const doc of scenario.docs) {
      const fields = Object.entries(doc.fields).map(([key, value]) => ({ key, value, confidence: doc.confidence }));
      await BidDocument.create({
        bidId: bid._id,
        bidderId: bidder._id,
        docType: doc.docType,
        fileName: `${doc.docType}_${scenario.submittedCompanyName.replace(/\s+/g, "_")}.pdf`,
        filePath: "seed/placeholder.pdf",
        mimeType: "application/pdf",
        status: "OCR_DONE",
        ocrConfidence: doc.confidence,
        extractedFields: fields,
        uploadedBy: officer._id,
      });
    }

    console.log(`  -> running verification for Scenario ${scenario.id} (${scenario.title})`);
    const verified = await runVerification(String(bid._id), {
      userId: String(officer._id), name: officer.name, email: officer.email, role: officer.role, department: officer.department,
    });

    if (scenario.decision) {
      verified.decision = {
        outcome: scenario.decision.outcome,
        remarks: scenario.decision.remarks,
        decidedBy: officer._id as any,
        decidedAt: new Date(),
      };
      verified.status = scenario.decision.outcome;
      await verified.save();
    }
  }

  console.log("[seed] done.");
  console.log("");
  console.log("Demo accounts (password: Demo@123):");
  console.log("  Procurement Officer -> officer@complygem.demo");
  console.log("  Reviewer            -> reviewer@complygem.demo");
  console.log("  Admin                -> admin@complygem.demo");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
