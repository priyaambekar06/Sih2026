"""
ComplyGeM AI / Document Intelligence Service
-------------------------------------------------------------------------
Python FastAPI microservice responsible for OCR + NLP field extraction.
Sits between the Node/Express backend and AWS Textract:

    React -> Node/Express -> Python FastAPI (this service) -> AWS Textract

This service NEVER makes compliance decisions — it only returns extracted
fields and confidence scores. The deterministic rule engine in the Node
backend (services/ruleEngine.ts) is the sole source of PASS/WARNING/FAIL
and score calculations, per the project's human-in-the-loop / explainable-AI
requirements.
"""
import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mock_ocr import simulate_extraction, real_textract_extract

TEXTRACT_ENABLED = os.getenv("TEXTRACT_ENABLED", "false").lower() == "true"

app = FastAPI(
    title="ComplyGeM AI Service",
    description="Document OCR + NLP field extraction for GeM bid compliance verification.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class OcrRequest(BaseModel):
    documentId: str
    documentType: str
    filePath: str | None = None


class OcrFieldOut(BaseModel):
    value: str
    confidence: float


class OcrResponse(BaseModel):
    documentId: str
    documentType: str
    confidence: float
    fields: dict[str, OcrFieldOut]


@app.get("/health")
def health():
    return {"status": "ok", "service": "complygem-ai-service", "textractEnabled": TEXTRACT_ENABLED}


@app.post("/ocr/process", response_model=OcrResponse)
def process_document(req: OcrRequest):
    """
    Runs OCR + structured field extraction for a single document.
    Simulates realistic processing latency so the frontend's document
    processing pipeline animation (Uploaded -> OCR -> Extraction ->
    Validation) reads naturally in a live demo.
    """
    if req.documentType.upper() not in {"PAN", "GST", "UDYAM", "EPFO", "ESIC", "NSIC", "MCA", "OTHER"}:
        raise HTTPException(status_code=400, detail=f"Unsupported documentType: {req.documentType}")

    time.sleep(0.4)

    if TEXTRACT_ENABLED:
        result = real_textract_extract(req.filePath or "", req.documentType)
    else:
        result = simulate_extraction(req.documentType)

    return {
        "documentId": req.documentId,
        "documentType": req.documentType,
        "confidence": result["confidence"],
        "fields": result["fields"],
    }
