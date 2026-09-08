import { OcrResult } from "./ocrClient";

/**
 * Fallback simulator used only if the Python AI microservice is not
 * running (e.g. quick frontend-only demos). Mirrors the shape of
 * ai-service/mock_ocr.py so behaviour is identical either way.
 */
export async function simulateOcr(documentId: string, docType: string): Promise<OcrResult> {
  await new Promise((r) => setTimeout(r, 300));
  const confidence = 90 + Math.round(Math.random() * 8);
  return {
    documentId,
    documentType: docType,
    confidence,
    fields: {
      note: { value: "Local fallback OCR — start ai-service for full pipeline.", confidence },
    },
  };
}
