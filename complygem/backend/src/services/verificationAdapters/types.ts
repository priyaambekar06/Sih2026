export interface VerificationOutcome {
  matched: boolean;
  verifiedValue?: string;
  source: string;
  confidence: number; // confidence of the *source system*, not OCR
  reason?: string;
  raw?: Record<string, any>;
}

/**
 * VerificationProvider — the adapter contract every government data source
 * must implement. Swapping a Mock*Provider for a Real*Provider (hitting the
 * live GST/Udyam/EPFO/ESIC/MCA21/NSIC/GeM APIs) requires no changes anywhere
 * else in the codebase — only the binding in services/verificationAdapters/index.ts.
 */
export interface VerificationProvider {
  verifyPAN(pan: string, submittedName: string): Promise<VerificationOutcome>;
  verifyGST(gstin: string, panForLookup: string): Promise<VerificationOutcome>;
  verifyUdyam(udyamNumber: string, panForLookup: string): Promise<VerificationOutcome>;
  verifyEPFO(epfoNumber: string, panForLookup: string): Promise<VerificationOutcome>;
  verifyESIC(esicNumber: string, panForLookup: string): Promise<VerificationOutcome>;
  verifyNSIC(nsicNumber: string, panForLookup: string): Promise<VerificationOutcome>;
  verifyMCA(companyName: string, panForLookup: string): Promise<VerificationOutcome>;
  checkBlacklist(panForLookup: string, companyName: string): Promise<VerificationOutcome>;
}
