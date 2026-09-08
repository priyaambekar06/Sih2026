# ComplyGeM
**AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement**
Smart India Hackathon 2026 · Problem Statement SIH26100 · Theme: Smart Automation

ComplyGeM lets a Procurement Officer upload a bidder's documents (PAN, GST, Udyam/MSME, EPFO, ESIC,
NSIC, MCA21) and automatically runs them through:

```
DOCUMENTS → OCR → DATA EXTRACTION → MULTI-SOURCE VERIFICATION → RULE ENGINE
          → COMPLIANCE SCORE → RISK → EXPLANATION → OFFICER DECISION
```

AI/OCR is decision-support only. Every compliance score is produced by a deterministic,
auditable rule engine — never by an LLM — and the final procurement decision always belongs to
a human Procurement Officer.

---

## Screenshots

<table>
  <tr>
    <td width="50%">
      <img src="assets/Screenshot%202026-09-08%20215825.png" width="100%" alt="ComplyGeM dashboard" />
      <p align="center"><em>Dashboard</em></p>
    </td>
    <td width="50%">
      <img src="assets/Screenshot%202026-09-08%20215901.png" width="100%" alt="ComplyGeM dashboard - attention and recent bids" />
      <p align="center"><em>Dashboard — attention & recent bids</em></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="assets/Screenshot%202026-09-08%20215942.png" width="100%" alt="ComplyGeM reverification list" />
      <p align="center"><em>Reverification</em></p>
    </td>
    <td width="50%">
      <img src="assets/Screenshot%202026-09-08%20220316.png" width="100%" alt="ComplyGeM admin user management" />
      <p align="center"><em>Admin — user management</em></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="assets/Screenshot%202026-09-08%20220347.png" width="100%" alt="ComplyGeM audit logs" />
      <p align="center"><em>Audit logs</em></p>
    </td>
    <td width="50%">
      <img src="assets/Screenshot%202026-09-08%20220501.png" width="100%" alt="MongoDB container in Docker Desktop" />
      <p align="center"><em>MongoDB (Docker Desktop)</em></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="assets/Screenshot%202026-09-08%20223108.png" width="100%" alt="ComplyGeM document OCR review" />
      <p align="center"><em>Document / OCR review</em></p>
    </td>
    <td width="50%" align="center">
      ▶️ <a href="assets/SIH%20recording.mp4">Demo recording (.mp4, in repo)</a><br/>
      ▶️ <a href="https://drive.google.com/file/d/14-MKd9RWUaOsaNDqnQFbnk5m9ZgD2gfw/view?usp=drive_link">Demo recording (Google Drive)</a>
    </td>
  </tr>
</table>

---

## 1. Architecture

```
complygem/
├── frontend/     React 18 + TypeScript + Vite + Tailwind CSS + Recharts
├── backend/      Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT/RBAC
├── ai-service/   Python + FastAPI — OCR / NLP document intelligence (mocked Textract)
└── docker-compose.yml
```

```
React (frontend) ──HTTP──▶ Node/Express (backend) ──HTTP──▶ Python FastAPI (ai-service) ──▶ AWS Textract*
                                   │
                                   ├─▶ MongoDB (tenders, bidders, bids, documents, audit, notifications)
                                   └─▶ Verification adapters (PAN/GST/Udyam/EPFO/ESIC/NSIC/MCA/Blacklist)*

* Mocked in this prototype — see "Mock data & going live" below.
```

- **Frontend** — role-aware SPA (Admin / Procurement Officer / Reviewer), all pages listed in the
  brief: dashboard, tenders, bidders, bids, documents (drag-and-drop upload + split-screen OCR
  review), compliance (integrated into the bid detail page), review queue, reverification,
  reports, notifications, audit logs, and admin (users, tender rule defaults, integrations status).
- **Backend** — REST API, JWT auth, RBAC middleware, Mongoose models, the **deterministic rule
  engine** (`src/services/ruleEngine.ts`) and **risk engine** (`src/services/riskEngine.ts`), the
  **verification adapter** interface + mock providers (`src/services/verificationAdapters/`), and
  the orchestrating **compliance service** (`src/services/complianceService.ts`) that ties OCR
  output → verification → scoring → risk → recommendation together for a bid.
- **ai-service** — FastAPI microservice that simulates AWS Textract + NLP field extraction
  (`mock_ocr.py`), returning the same response shape a real Textract-backed service would.

### Component note
The brief specifies shadcn/ui. To keep the hackathon build self-contained and dependency-light,
the frontend ships a small hand-built component set (`src/components/ui/`) that mirrors shadcn's
visual language and API shape (`Card`, `Badge`, `Button`, `Tabs`, `Table`, `Dialog`, `Progress`,
`Alert`, `Sheet`, `Skeleton`, `Breadcrumb`, `Dropdown`, `Tooltip`, `Toast`) instead of pulling in
Radix UI. Swapping any of these for the real `npx shadcn-ui add <component>` output is a drop-in
change — the import paths (`@/components/ui/...`) already match shadcn's convention.

---

## 2. Running locally

Requires Node.js 20+, Python 3.11+, and MongoDB (local install or Docker).

### 2.1 Start MongoDB
```bash
docker run -d --name complygem-mongo -p 27017:27017 mongo:7
# or use your own local MongoDB instance
```

### 2.2 AI service (Python)
```bash
cd ai-service
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 2.3 Backend (Node/Express)
```bash
cd backend
cp .env.example .env        # defaults already point at localhost:27017 / :8000
npm install
npm run seed                # creates demo users, 3 tenders, 10 bidders/bids/scenarios
npm run dev                 # http://localhost:5000
```

### 2.4 Frontend (React)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Open **http://localhost:5173** and sign in with one of the demo accounts below.

### 2.5 Or run everything with Docker
```bash
docker compose up --build
# then, once containers are healthy:
docker compose exec backend npm run seed
```
Frontend → http://localhost:8080 · Backend → http://localhost:5000 · AI service → http://localhost:8000

> **Note on this environment:** this codebase was written and assembled in a sandbox without
> package-registry network access, so `npm install` / `pip install` / a full build could not be
> executed here to produce a live-tested binary. Every file is complete, internally consistent
> TypeScript/Python/React and has been checked by hand (and Python's own parser for `ai-service`);
> run the install steps above on your machine to build and verify.

---

## 3. Demo accounts
Seeded by `npm run seed`. Password for all three: **`Demo@123`**

| Role                 | Email                        |
|----------------------|-------------------------------|
| Procurement Officer  | officer@complygem.demo        |
| Reviewer             | reviewer@complygem.demo       |
| Admin                | admin@complygem.demo          |

---

## 4. The 10 demo scenarios
`npm run seed` creates 3 tenders and 10 bidders/bids — one per required scenario — and runs each
through the real verification + rule engine pipeline so every score, risk level and mismatch is
computed live, not hardcoded:

1. Fully compliant bidder
2. GST inactive
3. PAN mismatch (submitted legal name ≠ PAN holder of record)
4. Company name mismatch (MCA21 name differs materially)
5. Missing NSIC document (on a tender that requires it)
6. Low OCR confidence (61–64%) → routed to manual review
7. Blacklisted bidder (matches the mock GeM/departmental restriction list)
8. Expired registration (NSIC certificate past its expiry date)
9. Multiple cross-document mismatches (GST inactive + MCA name differs + EPFO inactive)
10. Perfect bidder (every source matches, approved without conditions)

Each is tagged on its Bid record (`scenarioTag`) and visible as a badge on the bid detail page,
so scenarios are easy to pick out during a live demo from **Bids** or **Dashboard → Recent Bids**.

---

## 5. Mock data & going live
Every external government data source is implemented behind the `VerificationProvider` interface
(`backend/src/services/verificationAdapters/types.ts`). The mock implementations
(`mockProviders.ts`) read from a small in-repo "source of truth" registry
(`mockGovRegistry.ts`) that stands in for GSTN, the Udyam portal, EPFO, ESIC, NSIC and MCA21.

To go live: implement a `CompositeRealProvider` that calls the real APIs and satisfies the same
interface, then swap the one binding line in `verificationAdapters/index.ts`. No controller,
route, rule-engine, or frontend code needs to change. The same pattern applies to OCR — swap
`ai-service/mock_ocr.py`'s `simulate_extraction()` for the stubbed `real_textract_extract()` once
AWS credentials are configured (`TEXTRACT_ENABLED=true`).

Admin → Integrations (in the app) shows live status of every adapter (mocked vs configured).

---

## 6. Key design decisions
- **AI never decides compliance.** OCR/NLP (Python service) only ever produces extracted field
  values and confidence scores. All PASS/WARNING/FAIL determinations and the compliance score
  itself are computed by fixed, auditable TypeScript logic in `ruleEngine.ts` — see section 25 of
  the original brief.
- **Human-in-the-loop.** Any extracted field below the OCR confidence threshold (default 75%,
  configurable at Admin → Tender Rules) routes the document to Manual Review — it is never
  auto-rejected.
- **Explainability everywhere.** The compliance score view always shows the point breakdown, the
  risk score always shows its contributing factors, and every mismatch includes a plain-language
  explanation and a recommendation — never just a number.
- **Officer has the final word.** The Decision modal reiterates "AI analysis is advisory only"
  before an officer can approve, conditionally approve, request clarification, or reject a bid,
  and always requires remarks.

---

## 7. Tech stack
| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, React Router, lucide-react |
| Backend | Node.js, Express, TypeScript, MongoDB/Mongoose, JWT, RBAC middleware, Multer, Nodemailer |
| AI/Document processing | Python, FastAPI, (AWS Textract integration point, currently mocked) |
| Storage | Local disk in this prototype (`backend/uploads/`) — swap for AWS S3 / Supabase Storage by replacing `config/upload.ts` |
| DevOps | Docker, docker-compose, GitHub-ready repo layout |
