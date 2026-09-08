
export interface OcrField {
  key: string;
  value: string;
  confidence: number;
}

export interface OcrResult {
  documentId: string;
  documentType: string;
  confidence: number;
  fields: Record<string, { value: string; confidence: number }>;
}

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Calls the Python FastAPI AI service, which wraps AWS Textract + NLP field
 * extraction. In this repo the FastAPI service itself returns *simulated*
 * Textract output (see ai-service/mock_ocr.py) so the full pipeline can be
 * demonstrated without live AWS credentials. Swapping in real Textract only
 * requires changing ai-service/main.py — this client is unaffected.
 */
export async function requestOcr(documentId: string, docType: string, filePath: string): Promise<OcrResult> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/ocr/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, documentType: docType, filePath }),
    });
    if (!res.ok) throw new Error(`AI service responded ${res.status}`);
    return (await res.json()) as OcrResult;
  } catch (err) {
    console.warn("[ocrClient] AI service unreachable, falling back to local simulator:", (err as Error).message);
    const { simulateOcr } = await import("./localOcrSimulator");
    return simulateOcr(documentId, docType);
  }
}
