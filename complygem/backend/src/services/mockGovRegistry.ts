/**
 * MOCK GOVERNMENT DATA REGISTRY
 * -------------------------------------------------------------------------
 * Simulates the "source of truth" records that would normally be fetched
 * live from GST Network, Udyam Registration Portal, EPFO, ESIC, MCA21 and
 * the GeM blacklist. In production, each entry below is replaced by a real
 * API response from the respective government system — the adapter
 * interface (see verificationAdapters/) does not change.
 *
 * Keyed by PAN, which is the common identifier tying every other document
 * to a single legal entity.
 */

export interface GovRecord {
  pan: string;
  panHolderName: string;
  panValid: boolean;
  gstin?: string;
  gstLegalName?: string;
  gstStatus?: "Active" | "Inactive" | "Cancelled";
  udyamNumber?: string;
  udyamEnterpriseName?: string;
  udyamValid?: boolean;
  cin?: string;
  mcaCompanyName?: string;
  mcaStatus?: "Active" | "Struck Off" | "Under Liquidation";
  epfoNumber?: string;
  epfoActive?: boolean;
  esicNumber?: string;
  esicActive?: boolean;
  nsicNumber?: string;
  nsicValid?: boolean;
  nsicExpiryDate?: string;
  isBlacklisted?: boolean;
  blacklistSource?: string;
}

export const govRegistry: Record<string, GovRecord> = {
  ABCDE1234F: {
    pan: "ABCDE1234F",
    panHolderName: "ABC Technologies Pvt Ltd",
    panValid: true,
    gstin: "27ABCDE1234F1Z5",
    gstLegalName: "ABC Technologies Pvt Ltd",
    gstStatus: "Active",
    udyamNumber: "UDYAM-MH-12-0012345",
    udyamEnterpriseName: "ABC Technologies Pvt Ltd",
    udyamValid: true,
    cin: "U72900MH2015PTC123456",
    mcaCompanyName: "ABC Technologies Private Limited",
    mcaStatus: "Active",
    epfoNumber: "MH/BAN/1234567/000",
    epfoActive: true,
    esicNumber: "31000123450000999",
    esicActive: true,
    nsicNumber: "NSIC/MH/2023/001122",
    nsicValid: true,
    nsicExpiryDate: "2027-03-31",
    isBlacklisted: false,
  },
  BXFPS7654K: {
    pan: "BXFPS7654K",
    panHolderName: "Sunrise Infra Solutions LLP",
    panValid: true,
    gstin: "09BXFPS7654K1Z2",
    gstLegalName: "Sunrise Infra Solutions LLP",
    gstStatus: "Inactive",
    udyamNumber: "UDYAM-UP-03-0045678",
    udyamEnterpriseName: "Sunrise Infra Solutions LLP",
    udyamValid: true,
    cin: "AAF-2233",
    mcaCompanyName: "Sunrise Infra Solutions LLP",
    mcaStatus: "Active",
    epfoNumber: "UP/LKO/7788990/000",
    epfoActive: true,
    esicNumber: "21000998877770001",
    esicActive: false,
    isBlacklisted: false,
  },
  CDEFG2345L: {
    pan: "CDEFG2345L",
    panHolderName: "Nova Electricals Pvt Ltd",
    panValid: true,
    gstin: "24CDEFG2345L1Z9",
    gstLegalName: "Nova Electricals Private Limited",
    gstStatus: "Active",
    udyamNumber: "UDYAM-GJ-08-0033445",
    udyamEnterpriseName: "Nova Electricals Pvt Ltd",
    udyamValid: true,
    cin: "U31900GJ2012PTC067890",
    mcaCompanyName: "Nova Electricals Private Limited",
    mcaStatus: "Active",
    epfoNumber: "GJ/AHM/3345566/000",
    epfoActive: true,
    esicNumber: "17000445566770002",
    esicActive: true,
    isBlacklisted: false,
  },
  // PAN mismatch scenario: bidder submitted PAN belongs to a different entity
  DPQRS9988M: {
    pan: "DPQRS9988M",
    panHolderName: "Kiran Enterprises",
    panValid: true,
    gstin: "07DPQRS9988M1Z4",
    gstLegalName: "Vertex Systems Pvt Ltd",
    gstStatus: "Active",
    udyamNumber: "UDYAM-DL-01-0022334",
    udyamEnterpriseName: "Vertex Systems Pvt Ltd",
    udyamValid: true,
    cin: "U74900DL2016PTC334455",
    mcaCompanyName: "Vertex Systems Private Limited",
    mcaStatus: "Active",
    epfoNumber: "DL/DEL/2233445/000",
    epfoActive: true,
    esicNumber: "17000112233440003",
    esicActive: true,
    isBlacklisted: false,
  },
  // Company name mismatch scenario: MCA name differs materially
  EFGHI3456N: {
    pan: "EFGHI3456N",
    panHolderName: "Greenfield Agro Pvt Ltd",
    panValid: true,
    gstin: "29EFGHI3456N1Z1",
    gstLegalName: "Greenfield Agro Pvt Ltd",
    gstStatus: "Active",
    udyamNumber: "UDYAM-KA-05-0011223",
    udyamEnterpriseName: "Greenfield Agro Pvt Ltd",
    udyamValid: true,
    cin: "U01100KA2011PTC998877",
    mcaCompanyName: "Greenfield Organic Foods Private Limited",
    mcaStatus: "Active",
    epfoNumber: "KA/BLR/9988776/000",
    epfoActive: true,
    esicNumber: "31000998866550004",
    esicActive: true,
    isBlacklisted: false,
  },
  // Missing NSIC scenario handled at submission level (no nsicNumber)
  FGHIJ4567P: {
    pan: "FGHIJ4567P",
    panHolderName: "Orbit Manufacturing Co",
    panValid: true,
    gstin: "33FGHIJ4567P1Z7",
    gstLegalName: "Orbit Manufacturing Co",
    gstStatus: "Active",
    udyamNumber: "UDYAM-TN-02-0055667",
    udyamEnterpriseName: "Orbit Manufacturing Co",
    udyamValid: true,
    cin: "U29100TN2013PTC112233",
    mcaCompanyName: "Orbit Manufacturing Company Private Limited",
    mcaStatus: "Active",
    epfoNumber: "TN/CHN/5566778/000",
    epfoActive: true,
    esicNumber: "34000556677880005",
    esicActive: true,
    isBlacklisted: false,
  },
  // Blacklisted bidder scenario
  GHIJK5678Q: {
    pan: "GHIJK5678Q",
    panHolderName: "Falcon Traders Pvt Ltd",
    panValid: true,
    gstin: "06GHIJK5678Q1Z8",
    gstLegalName: "Falcon Traders Pvt Ltd",
    gstStatus: "Active",
    udyamNumber: "UDYAM-HR-04-0066778",
    udyamEnterpriseName: "Falcon Traders Pvt Ltd",
    udyamValid: true,
    cin: "U51900HR2010PTC223344",
    mcaCompanyName: "Falcon Traders Private Limited",
    mcaStatus: "Active",
    epfoNumber: "HR/GGN/6677889/000",
    epfoActive: true,
    esicNumber: "12000667788990006",
    esicActive: true,
    isBlacklisted: true,
    blacklistSource: "Departmental Vendor Restriction List (2025)",
  },
  // Expired registration scenario
  HIJKL6789R: {
    pan: "HIJKL6789R",
    panHolderName: "Prime Logistics Pvt Ltd",
    panValid: true,
    gstin: "19HIJKL6789R1Z3",
    gstLegalName: "Prime Logistics Pvt Ltd",
    gstStatus: "Active",
    udyamNumber: "UDYAM-WB-07-0077889",
    udyamEnterpriseName: "Prime Logistics Pvt Ltd",
    udyamValid: true,
    cin: "U63000WB2009PTC334422",
    mcaCompanyName: "Prime Logistics Private Limited",
    mcaStatus: "Active",
    epfoNumber: "WB/KOL/7788990/000",
    epfoActive: true,
    esicNumber: "36000778899000007",
    esicActive: true,
    nsicNumber: "NSIC/WB/2021/004455",
    nsicValid: false,
    nsicExpiryDate: "2024-06-30",
    isBlacklisted: false,
  },
  // Multiple cross-document mismatches
  IJKLM7890S: {
    pan: "IJKLM7890S",
    panHolderName: "Zenith Constructions",
    panValid: true,
    gstin: "08IJKLM7890S1Z6",
    gstLegalName: "Zenith Buildcon Pvt Ltd",
    gstStatus: "Inactive",
    udyamNumber: "UDYAM-RJ-06-0088990",
    udyamEnterpriseName: "Zenith Infra Pvt Ltd",
    udyamValid: true,
    cin: "U45200RJ2014PTC556677",
    mcaCompanyName: "Zenith Constructions & Infra Private Limited",
    mcaStatus: "Active",
    epfoNumber: "RJ/JAI/8899001/000",
    epfoActive: false,
    esicNumber: "13000889900110008",
    esicActive: true,
    isBlacklisted: false,
  },
  // Perfect bidder
  JKLMN8901T: {
    pan: "JKLMN8901T",
    panHolderName: "Everest Software Solutions Pvt Ltd",
    panValid: true,
    gstin: "29JKLMN8901T1Z0",
    gstLegalName: "Everest Software Solutions Pvt Ltd",
    gstStatus: "Active",
    udyamNumber: "UDYAM-KA-09-0099001",
    udyamEnterpriseName: "Everest Software Solutions Pvt Ltd",
    udyamValid: true,
    cin: "U72200KA2017PTC667788",
    mcaCompanyName: "Everest Software Solutions Private Limited",
    mcaStatus: "Active",
    epfoNumber: "KA/BLR/9900112/000",
    epfoActive: true,
    esicNumber: "31000990011220009",
    esicActive: true,
    nsicNumber: "NSIC/KA/2024/007788",
    nsicValid: true,
    nsicExpiryDate: "2028-01-31",
    isBlacklisted: false,
  },
};

export function lookupByPan(pan: string): GovRecord | undefined {
  return govRegistry[pan?.toUpperCase()];
}
