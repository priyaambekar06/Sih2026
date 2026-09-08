import { CompositeMockProvider } from "./mockProviders";
import { VerificationProvider } from "./types";

/**
 * Single binding point. To go live, swap CompositeMockProvider for a
 * CompositeRealProvider that calls actual GSTN/Udyam/EPFO/ESIC/MCA21/NSIC/GeM
 * endpoints — nothing else in routes/services needs to change because both
 * implement the same VerificationProvider interface.
 */
export const verificationProvider: VerificationProvider = new CompositeMockProvider();
export * from "./types";
