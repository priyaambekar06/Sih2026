import { govRegistry } from "../services/mockGovRegistry";

export interface ScenarioDoc {
  docType: "PAN" | "GST" | "UDYAM" | "EPFO" | "ESIC" | "NSIC" | "MCA";
  fields: Record<string, string>;
  confidence: number;
  skip?: boolean;
}

export interface Scenario {
  id: number;
  title: string;
  pan: string; // key into govRegistry — the "ground truth"
  submittedCompanyName: string;
  tenderIndex: 0 | 1 | 2;
  docs: ScenarioDoc[];
  decision?: { outcome: "APPROVED" | "REJECTED"; remarks: string };
}

const g = govRegistry;

export const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Fully compliant bidder",
    pan: "ABCDE1234F",
    submittedCompanyName: g.ABCDE1234F.panHolderName,
    tenderIndex: 0,
    docs: [
      { docType: "PAN", fields: { panNumber: "ABCDE1234F", legalName: g.ABCDE1234F.panHolderName }, confidence: 98 },
      { docType: "GST", fields: { gstin: g.ABCDE1234F.gstin!, legalName: g.ABCDE1234F.gstLegalName!, status: g.ABCDE1234F.gstStatus! }, confidence: 96 },
      { docType: "UDYAM", fields: { udyamNumber: g.ABCDE1234F.udyamNumber!, enterpriseName: g.ABCDE1234F.udyamEnterpriseName! }, confidence: 95 },
      { docType: "EPFO", fields: { epfoNumber: g.ABCDE1234F.epfoNumber! }, confidence: 94 },
      { docType: "ESIC", fields: { esicNumber: g.ABCDE1234F.esicNumber! }, confidence: 93 },
      { docType: "NSIC", fields: { nsicNumber: g.ABCDE1234F.nsicNumber! }, confidence: 92 },
      { docType: "MCA", fields: { companyName: g.ABCDE1234F.mcaCompanyName!, cin: g.ABCDE1234F.cin! }, confidence: 97 },
    ],
    decision: { outcome: "APPROVED", remarks: "All requirements verified. Cleared for award." },
  },
  {
    id: 2,
    title: "GST inactive",
    pan: "BXFPS7654K",
    submittedCompanyName: g.BXFPS7654K.panHolderName,
    tenderIndex: 0,
    docs: [
      { docType: "PAN", fields: { panNumber: "BXFPS7654K", legalName: g.BXFPS7654K.panHolderName }, confidence: 97 },
      { docType: "GST", fields: { gstin: g.BXFPS7654K.gstin!, legalName: g.BXFPS7654K.gstLegalName!, status: "Active" }, confidence: 95 },
      { docType: "UDYAM", fields: { udyamNumber: g.BXFPS7654K.udyamNumber!, enterpriseName: g.BXFPS7654K.udyamEnterpriseName! }, confidence: 94 },
      { docType: "EPFO", fields: { epfoNumber: g.BXFPS7654K.epfoNumber! }, confidence: 93 },
      { docType: "ESIC", fields: { esicNumber: g.BXFPS7654K.esicNumber! }, confidence: 91 },
      { docType: "MCA", fields: { companyName: g.BXFPS7654K.mcaCompanyName!, cin: g.BXFPS7654K.cin! }, confidence: 90 },
    ],
  },
  {
    id: 3,
    title: "PAN mismatch",
    pan: "DPQRS9988M",
    submittedCompanyName: "Vertex Systems Pvt Ltd",
    tenderIndex: 0,
    docs: [
      { docType: "PAN", fields: { panNumber: "DPQRS9988M", legalName: "Vertex Systems Pvt Ltd" }, confidence: 96 },
      { docType: "GST", fields: { gstin: g.DPQRS9988M.gstin!, legalName: g.DPQRS9988M.gstLegalName!, status: g.DPQRS9988M.gstStatus! }, confidence: 95 },
      { docType: "UDYAM", fields: { udyamNumber: g.DPQRS9988M.udyamNumber!, enterpriseName: g.DPQRS9988M.udyamEnterpriseName! }, confidence: 94 },
      { docType: "EPFO", fields: { epfoNumber: g.DPQRS9988M.epfoNumber! }, confidence: 93 },
      { docType: "ESIC", fields: { esicNumber: g.DPQRS9988M.esicNumber! }, confidence: 92 },
      { docType: "MCA", fields: { companyName: g.DPQRS9988M.mcaCompanyName!, cin: g.DPQRS9988M.cin! }, confidence: 91 },
    ],
  },
  {
    id: 4,
    title: "Company name mismatch",
    pan: "EFGHI3456N",
    submittedCompanyName: g.EFGHI3456N.panHolderName,
    tenderIndex: 1,
    docs: [
      { docType: "PAN", fields: { panNumber: "EFGHI3456N", legalName: g.EFGHI3456N.panHolderName }, confidence: 97 },
      { docType: "GST", fields: { gstin: g.EFGHI3456N.gstin!, legalName: g.EFGHI3456N.gstLegalName!, status: g.EFGHI3456N.gstStatus! }, confidence: 96 },
      { docType: "UDYAM", fields: { udyamNumber: g.EFGHI3456N.udyamNumber!, enterpriseName: g.EFGHI3456N.udyamEnterpriseName! }, confidence: 95 },
      { docType: "EPFO", fields: { epfoNumber: g.EFGHI3456N.epfoNumber! }, confidence: 94 },
      { docType: "ESIC", fields: { esicNumber: g.EFGHI3456N.esicNumber! }, confidence: 93 },
      { docType: "MCA", fields: { companyName: "Greenfield Agro Pvt Ltd", cin: g.EFGHI3456N.cin! }, confidence: 90 },
    ],
  },
  {
    id: 5,
    title: "Missing NSIC document",
    pan: "FGHIJ4567P",
    submittedCompanyName: g.FGHIJ4567P.panHolderName,
    tenderIndex: 1,
    docs: [
      { docType: "PAN", fields: { panNumber: "FGHIJ4567P", legalName: g.FGHIJ4567P.panHolderName }, confidence: 98 },
      { docType: "GST", fields: { gstin: g.FGHIJ4567P.gstin!, legalName: g.FGHIJ4567P.gstLegalName!, status: g.FGHIJ4567P.gstStatus! }, confidence: 96 },
      { docType: "UDYAM", fields: { udyamNumber: g.FGHIJ4567P.udyamNumber!, enterpriseName: g.FGHIJ4567P.udyamEnterpriseName! }, confidence: 95 },
      { docType: "EPFO", fields: { epfoNumber: g.FGHIJ4567P.epfoNumber! }, confidence: 94 },
      { docType: "ESIC", fields: { esicNumber: g.FGHIJ4567P.esicNumber! }, confidence: 93 },
      { docType: "MCA", fields: { companyName: g.FGHIJ4567P.mcaCompanyName!, cin: g.FGHIJ4567P.cin! }, confidence: 92 },
      // NSIC intentionally omitted
    ],
  },
  {
    id: 6,
    title: "Low OCR confidence",
    pan: "CDEFG2345L",
    submittedCompanyName: g.CDEFG2345L.panHolderName,
    tenderIndex: 0,
    docs: [
      { docType: "PAN", fields: { panNumber: "CDEFG2345L", legalName: g.CDEFG2345L.panHolderName }, confidence: 61 },
      { docType: "GST", fields: { gstin: g.CDEFG2345L.gstin!, legalName: g.CDEFG2345L.gstLegalName!, status: g.CDEFG2345L.gstStatus! }, confidence: 64 },
      { docType: "UDYAM", fields: { udyamNumber: g.CDEFG2345L.udyamNumber!, enterpriseName: g.CDEFG2345L.udyamEnterpriseName! }, confidence: 96 },
      { docType: "EPFO", fields: { epfoNumber: g.CDEFG2345L.epfoNumber! }, confidence: 95 },
      { docType: "ESIC", fields: { esicNumber: g.CDEFG2345L.esicNumber! }, confidence: 94 },
      { docType: "MCA", fields: { companyName: g.CDEFG2345L.mcaCompanyName!, cin: g.CDEFG2345L.cin! }, confidence: 93 },
    ],
  },
  {
    id: 7,
    title: "Blacklisted bidder",
    pan: "GHIJK5678Q",
    submittedCompanyName: g.GHIJK5678Q.panHolderName,
    tenderIndex: 2,
    docs: [
      { docType: "PAN", fields: { panNumber: "GHIJK5678Q", legalName: g.GHIJK5678Q.panHolderName }, confidence: 97 },
      { docType: "GST", fields: { gstin: g.GHIJK5678Q.gstin!, legalName: g.GHIJK5678Q.gstLegalName!, status: g.GHIJK5678Q.gstStatus! }, confidence: 96 },
      { docType: "UDYAM", fields: { udyamNumber: g.GHIJK5678Q.udyamNumber!, enterpriseName: g.GHIJK5678Q.udyamEnterpriseName! }, confidence: 95 },
      { docType: "EPFO", fields: { epfoNumber: g.GHIJK5678Q.epfoNumber! }, confidence: 94 },
      { docType: "ESIC", fields: { esicNumber: g.GHIJK5678Q.esicNumber! }, confidence: 93 },
      { docType: "MCA", fields: { companyName: g.GHIJK5678Q.mcaCompanyName!, cin: g.GHIJK5678Q.cin! }, confidence: 92 },
    ],
    decision: { outcome: "REJECTED", remarks: "Bidder matched departmental vendor restriction list. Escalated and rejected per procurement policy." },
  },
  {
    id: 8,
    title: "Expired registration",
    pan: "HIJKL6789R",
    submittedCompanyName: g.HIJKL6789R.panHolderName,
    tenderIndex: 1,
    docs: [
      { docType: "PAN", fields: { panNumber: "HIJKL6789R", legalName: g.HIJKL6789R.panHolderName }, confidence: 96 },
      { docType: "GST", fields: { gstin: g.HIJKL6789R.gstin!, legalName: g.HIJKL6789R.gstLegalName!, status: g.HIJKL6789R.gstStatus! }, confidence: 95 },
      { docType: "UDYAM", fields: { udyamNumber: g.HIJKL6789R.udyamNumber!, enterpriseName: g.HIJKL6789R.udyamEnterpriseName! }, confidence: 94 },
      { docType: "EPFO", fields: { epfoNumber: g.HIJKL6789R.epfoNumber! }, confidence: 93 },
      { docType: "ESIC", fields: { esicNumber: g.HIJKL6789R.esicNumber! }, confidence: 92 },
      { docType: "NSIC", fields: { nsicNumber: g.HIJKL6789R.nsicNumber! }, confidence: 90 },
      { docType: "MCA", fields: { companyName: g.HIJKL6789R.mcaCompanyName!, cin: g.HIJKL6789R.cin! }, confidence: 91 },
    ],
  },
  {
    id: 9,
    title: "Multiple cross-document mismatches",
    pan: "IJKLM7890S",
    submittedCompanyName: "Zenith Constructions",
    tenderIndex: 1,
    docs: [
      { docType: "PAN", fields: { panNumber: "IJKLM7890S", legalName: "Zenith Constructions" }, confidence: 95 },
      { docType: "GST", fields: { gstin: g.IJKLM7890S.gstin!, legalName: g.IJKLM7890S.gstLegalName!, status: "Active" }, confidence: 94 },
      { docType: "UDYAM", fields: { udyamNumber: g.IJKLM7890S.udyamNumber!, enterpriseName: g.IJKLM7890S.udyamEnterpriseName! }, confidence: 93 },
      { docType: "EPFO", fields: { epfoNumber: g.IJKLM7890S.epfoNumber! }, confidence: 92 },
      { docType: "ESIC", fields: { esicNumber: g.IJKLM7890S.esicNumber! }, confidence: 91 },
      { docType: "MCA", fields: { companyName: "Zenith Constructions", cin: g.IJKLM7890S.cin! }, confidence: 90 },
    ],
  },
  {
    id: 10,
    title: "Perfect bidder",
    pan: "JKLMN8901T",
    submittedCompanyName: g.JKLMN8901T.panHolderName,
    tenderIndex: 2,
    docs: [
      { docType: "PAN", fields: { panNumber: "JKLMN8901T", legalName: g.JKLMN8901T.panHolderName }, confidence: 99 },
      { docType: "GST", fields: { gstin: g.JKLMN8901T.gstin!, legalName: g.JKLMN8901T.gstLegalName!, status: g.JKLMN8901T.gstStatus! }, confidence: 98 },
      { docType: "UDYAM", fields: { udyamNumber: g.JKLMN8901T.udyamNumber!, enterpriseName: g.JKLMN8901T.udyamEnterpriseName! }, confidence: 97 },
      { docType: "EPFO", fields: { epfoNumber: g.JKLMN8901T.epfoNumber! }, confidence: 98 },
      { docType: "ESIC", fields: { esicNumber: g.JKLMN8901T.esicNumber! }, confidence: 97 },
      { docType: "NSIC", fields: { nsicNumber: g.JKLMN8901T.nsicNumber! }, confidence: 96 },
      { docType: "MCA", fields: { companyName: g.JKLMN8901T.mcaCompanyName!, cin: g.JKLMN8901T.cin! }, confidence: 99 },
    ],
    decision: { outcome: "APPROVED", remarks: "Exemplary compliance across all requirements. Approved without conditions." },
  },
];
