import { lookupByPan } from "../mockGovRegistry";
import { VerificationOutcome, VerificationProvider } from "./types";

/** Fuzzy-ish name compare: normalizes case, punctuation and common suffixes. */
function namesEquivalent(a?: string, b?: string): { equal: boolean; closeMatch: boolean } {
  if (!a || !b) return { equal: false, closeMatch: false };
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/private limited|pvt ltd|pvt\.? ltd\.?|llp|ltd\.?|limited|co\.?/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  const na = norm(a);
  const nb = norm(b);
  if (na === nb) return { equal: true, closeMatch: true };
  const closeMatch = na.includes(nb) || nb.includes(na);
  return { equal: false, closeMatch };
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/** Simulated network latency for the demo's "live verification" feel. */
const LATENCY_MS = 120;

export class MockPANProvider {
  async verifyPAN(pan: string, submittedName: string): Promise<VerificationOutcome> {
    await delay(LATENCY_MS);
    const record = lookupByPan(pan);
    if (!record || !record.panValid) {
      return { matched: false, source: "Mock Income Tax PAN Registry", confidence: 97, reason: "PAN not found or invalid." };
    }
    const { equal, closeMatch } = namesEquivalent(record.panHolderName, submittedName);
    return {
      matched: equal || closeMatch,
      verifiedValue: record.panHolderName,
      source: "Mock Income Tax PAN Registry",
      confidence: 97,
      reason: equal ? undefined : closeMatch ? "Minor name variation." : "PAN holder name differs from submitted entity name.",
    };
  }
}

export class MockGSTProvider {
  async verifyGST(gstin: string, panForLookup: string): Promise<VerificationOutcome> {
    await delay(LATENCY_MS);
    const record = lookupByPan(panForLookup);
    if (!record?.gstin) {
      return { matched: false, source: "Mock GST Network (GSTN)", confidence: 95, reason: "No GST registration found for this PAN." };
    }
    const matched = record.gstin === gstin && record.gstStatus === "Active";
    return {
      matched,
      verifiedValue: `${record.gstin} — ${record.gstStatus}`,
      source: "Mock GST Network (GSTN)",
      confidence: 95,
      reason:
        record.gstin !== gstin
          ? "Submitted GSTIN does not match GSTN records."
          : record.gstStatus !== "Active"
          ? `GSTIN is currently ${record.gstStatus} on GSTN.`
          : undefined,
    };
  }
}

export class MockUdyamProvider {
  async verifyUdyam(udyamNumber: string, panForLookup: string): Promise<VerificationOutcome> {
    await delay(LATENCY_MS);
    const record = lookupByPan(panForLookup);
    if (!record?.udyamNumber) {
      return { matched: false, source: "Mock Udyam Registration Portal", confidence: 93, reason: "No Udyam/MSME registration found." };
    }
    const matched = record.udyamNumber === udyamNumber && !!record.udyamValid;
    return {
      matched,
      verifiedValue: record.udyamNumber,
      source: "Mock Udyam Registration Portal",
      confidence: 93,
      reason: matched ? undefined : "Udyam number does not match portal records.",
    };
  }
}

export class MockEPFOProvider {
  async verifyEPFO(epfoNumber: string, panForLookup: string): Promise<VerificationOutcome> {
    await delay(LATENCY_MS);
    const record = lookupByPan(panForLookup);
    if (!record?.epfoNumber) {
      return { matched: false, source: "Mock EPFO", confidence: 90, reason: "No EPFO establishment code found." };
    }
    const matched = record.epfoNumber === epfoNumber && !!record.epfoActive;
    return {
      matched,
      verifiedValue: `${record.epfoNumber}${record.epfoActive ? "" : " (Inactive)"}`,
      source: "Mock EPFO",
      confidence: 90,
      reason: matched ? undefined : "EPFO registration inactive or number mismatch.",
    };
  }
}

export class MockESICProvider {
  async verifyESIC(esicNumber: string, panForLookup: string): Promise<VerificationOutcome> {
    await delay(LATENCY_MS);
    const record = lookupByPan(panForLookup);
    if (!record?.esicNumber) {
      return { matched: false, source: "Mock ESIC", confidence: 90, reason: "No ESIC registration found." };
    }
    const matched = record.esicNumber === esicNumber && !!record.esicActive;
    return {
      matched,
      verifiedValue: `${record.esicNumber}${record.esicActive ? "" : " (Inactive)"}`,
      source: "Mock ESIC",
      confidence: 90,
      reason: matched ? undefined : "ESIC registration inactive or number mismatch.",
    };
  }
}

export class MockNSICProvider {
  async verifyNSIC(nsicNumber: string, panForLookup: string): Promise<VerificationOutcome> {
    await delay(LATENCY_MS);
    const record = lookupByPan(panForLookup);
    if (!record?.nsicNumber) {
      return { matched: false, source: "Mock NSIC", confidence: 88, reason: "No NSIC single-point registration certificate found." };
    }
    const expired = record.nsicExpiryDate ? new Date(record.nsicExpiryDate) < new Date() : false;
    const matched = record.nsicNumber === nsicNumber && !!record.nsicValid && !expired;
    return {
      matched,
      verifiedValue: `${record.nsicNumber}${expired ? " (Expired)" : ""}`,
      source: "Mock NSIC",
      confidence: 88,
      reason: expired ? `NSIC certificate expired on ${record.nsicExpiryDate}.` : matched ? undefined : "NSIC certificate could not be validated.",
    };
  }
}

export class MockMCAProvider {
  async verifyMCA(companyName: string, panForLookup: string): Promise<VerificationOutcome> {
    await delay(LATENCY_MS);
    const record = lookupByPan(panForLookup);
    if (!record?.mcaCompanyName) {
      return { matched: false, source: "Mock MCA21", confidence: 92, reason: "No company record found on MCA21." };
    }
    const { equal, closeMatch } = namesEquivalent(record.mcaCompanyName, companyName);
    return {
      matched: equal || closeMatch,
      verifiedValue: `${record.mcaCompanyName} (${record.cin}) — ${record.mcaStatus}`,
      source: "Mock MCA21",
      confidence: 92,
      reason: equal
        ? undefined
        : closeMatch
        ? "Company name on MCA21 varies slightly from submission."
        : "Company name on MCA21 differs materially from submission.",
    };
  }
}

export class MockBlacklistProvider {
  async checkBlacklist(panForLookup: string, companyName: string): Promise<VerificationOutcome> {
    await delay(LATENCY_MS);
    const record = lookupByPan(panForLookup);
    const blacklisted = !!record?.isBlacklisted;
    return {
      matched: !blacklisted,
      verifiedValue: blacklisted ? record?.blacklistSource : "No match",
      source: "Mock GeM Blacklist + Departmental Vendor Restriction List",
      confidence: 99,
      reason: blacklisted ? `Match found on ${record?.blacklistSource}.` : undefined,
    };
  }
}

export class CompositeMockProvider implements VerificationProvider {
  private pan = new MockPANProvider();
  private gst = new MockGSTProvider();
  private udyam = new MockUdyamProvider();
  private epfo = new MockEPFOProvider();
  private esic = new MockESICProvider();
  private nsic = new MockNSICProvider();
  private mca = new MockMCAProvider();
  private blacklist = new MockBlacklistProvider();

  verifyPAN(pan: string, submittedName: string) {
    return this.pan.verifyPAN(pan, submittedName);
  }
  verifyGST(gstin: string, panForLookup: string) {
    return this.gst.verifyGST(gstin, panForLookup);
  }
  verifyUdyam(udyamNumber: string, panForLookup: string) {
    return this.udyam.verifyUdyam(udyamNumber, panForLookup);
  }
  verifyEPFO(epfoNumber: string, panForLookup: string) {
    return this.epfo.verifyEPFO(epfoNumber, panForLookup);
  }
  verifyESIC(esicNumber: string, panForLookup: string) {
    return this.esic.verifyESIC(esicNumber, panForLookup);
  }
  verifyNSIC(nsicNumber: string, panForLookup: string) {
    return this.nsic.verifyNSIC(nsicNumber, panForLookup);
  }
  verifyMCA(companyName: string, panForLookup: string) {
    return this.mca.verifyMCA(companyName, panForLookup);
  }
  checkBlacklist(panForLookup: string, companyName: string) {
    return this.blacklist.checkBlacklist(panForLookup, companyName);
  }
}
