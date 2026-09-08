"""
mock_ocr.py
-------------------------------------------------------------------------
Simulates AWS Textract + NLP document-intelligence output so the full
DOCUMENTS -> OCR -> DATA EXTRACTION pipeline can be demonstrated without
live AWS credentials.

Real Textract integration point: replace `simulate_extraction()` with a
call to `real_textract_extract()` (stubbed below) once AWS credentials
and TEXTRACT_ENABLED=true are configured. The FastAPI route and the
response schema stay identical either way, so the Node backend and React
frontend require no changes when going live.
"""
import random
import string
from typing import Dict

FIELD_TEMPLATES: Dict[str, list] = {
    "PAN": ["panNumber", "legalName"],
    "GST": ["gstin", "legalName", "status"],
    "UDYAM": ["udyamNumber", "enterpriseName"],
    "EPFO": ["epfoNumber"],
    "ESIC": ["esicNumber"],
    "NSIC": ["nsicNumber"],
    "MCA": ["companyName", "cin"],
    "OTHER": ["documentTitle"],
}


def _random_pan() -> str:
    letters = "".join(random.choices(string.ascii_uppercase, k=5))
    digits = "".join(random.choices(string.digits, k=4))
    return f"{letters}{digits}{random.choice(string.ascii_uppercase)}"


def _placeholder_value(field_key: str) -> str:
    if field_key == "panNumber":
        return _random_pan()
    if field_key == "gstin":
        return f"{random.randint(10,37)}{_random_pan()}1Z{random.randint(1,9)}"
    if field_key == "status":
        return random.choice(["Active", "Active", "Active", "Inactive"])
    if field_key in ("legalName", "enterpriseName", "companyName"):
        return "Unverified Extraction — Sample Pvt Ltd"
    if field_key == "cin":
        return f"U{random.randint(10000,99999)}DL{random.randint(2005,2022)}PTC{random.randint(100000,999999)}"
    if field_key.endswith("Number"):
        return f"{random.randint(10**9, 10**10 - 1)}"
    return "Unverified Extraction"


def simulate_extraction(document_type: str) -> dict:
    """
    Returns a Textract-shaped payload: overall confidence plus per-field
    values with individual confidence scores, mirroring how Textract's
    AnalyzeDocument (Queries/Forms) response would be flattened by the
    NLP normalization layer.
    """
    doc_type = document_type.upper() if document_type.upper() in FIELD_TEMPLATES else "OTHER"
    field_keys = FIELD_TEMPLATES[doc_type]

    # Skew confidence high most of the time, but occasionally simulate a
    # noisy scan (blurry photo, skewed page) that needs manual review.
    is_noisy_scan = random.random() < 0.15
    base_confidence = random.uniform(55, 74) if is_noisy_scan else random.uniform(88, 99.5)

    fields = {}
    for key in field_keys:
        jitter = random.uniform(-4, 2)
        field_confidence = max(40.0, min(99.9, base_confidence + jitter))
        fields[key] = {
            "value": _placeholder_value(key),
            "confidence": round(field_confidence, 1),
        }

    overall_confidence = round(sum(f["confidence"] for f in fields.values()) / len(fields), 1)

    return {"confidence": overall_confidence, "fields": fields}


def real_textract_extract(file_path: str, document_type: str) -> dict:
    """
    Stub for the production path. Uncomment and configure once AWS
    credentials are available:

        import boto3
        client = boto3.client("textract", region_name=os.getenv("AWS_REGION"))
        with open(file_path, "rb") as f:
            response = client.analyze_document(
                Document={"Bytes": f.read()},
                FeatureTypes=["FORMS", "QUERIES"],
            )
        # ... normalize response into {"confidence": ..., "fields": {...}}

    Raises NotImplementedError until wired up, so misconfiguration fails
    loudly instead of silently returning mock data in production.
    """
    raise NotImplementedError(
        "Real AWS Textract integration is not wired up in this prototype. "
        "Set TEXTRACT_ENABLED=false to keep using the simulator."
    )
