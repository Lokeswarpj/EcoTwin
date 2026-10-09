# EcoTwin — AI Planet Budget Platform

> **"Your Planet Budget, run by an AI Autopilot."**
> A full-stack sustainability platform treating everyday environmental impact like a personal-finance budget with cooperating Gemini AI agents.

---

## 🚀 Live Demo URLs

- **Frontend (React + Vite + TypeScript):** [http://localhost:5173](http://localhost:5173)
- **Backend (FastAPI + Python 3.14 + Gemini Live):** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🌟 Key Innovations & Architecture

### 1. Three Environmental Currencies
EcoTwin tracks three fundamental environmental currencies within 1.5°C Paris planetary limits:
1. **Carbon emissions:** `kg CO2e`
2. **Waste to landfill:** `kg` (with landfill diversion credit)
3. **Water consumption:** `litres`

### 2. Multi-Agent AI Pipeline
A genuine multi-agent orchestration architecture:
* **RouterAgent:** Inspects multimodal input (text, photo, receipt, bill) and selects the specialist with confidence scoring.
* **WasteRecyclingAgent:** Identifies item polymer composition, BBMP / Dry Waste Collection Centre (DWCC) rules, and landfill diversion impact.
* **FoodWasteGuardAgent:** Scans fridge items / receipts, highlights high-urgency perishables, and generates 3 zero-waste recipes.
* **EnergyAuditorAgent:** Parses BESCOM utility bills, benchmarks against neighborhood targets, and prioritizes peak solar load-shifting.
* **MobilityNegotiatorAgent:** Multimodal transit comparison (Metro vs BMTC bus vs Solo car vs EV) balancing carbon vs time vs fare cost.
* **ProductSustainabilityAgent:** Audits packaging recyclability, greenwashing claims, and refill alternatives.
* **CircularExchangeAgent:** Connects users with verified local Bengaluru circular recovery hubs (Hasiru Dala, Saahas, Goonj).
* **NegotiatorAgent:** Reconciles sustainability vs convenience trade-offs with transparent justification.
* **PlannerAgent:** Synthesizes planetary budgets, weather/AQI context, and household needs into a weekly action plan.
* **VerifierAgent:** Audits output against schemas, boundary constraints, and consistency rules.
* **Visible Agent Trace Drawer:** Expandable bottom panel allowing hackathon judges to inspect real step-by-step pipeline execution events.

### 3. Deterministic Impact & Solar Engine
* **No LLM arithmetic hallucination:** All emissions and savings are calculated in Python using verified factors (`emission_factors.json`, CEA Baseline Database, IPCC, and BESCOM power procurement data).
* **Solar Simulator:** Dynamic what-if rooftop PV model computing annual kWh, CO₂e avoided, payback period, and trees equivalent based on Bengaluru solar irradiance (5.4 peak sun hours/day).

---

## 📁 Repository Structure

```
EcoTwin/
├── backend/                  # Python 3.11+ / FastAPI Server
│   ├── app/                  # Multi-agent pipelines, routes, impact models
│   │   ├── agents/           # Router, Waste, Food, Energy, Mobility, Negotiator, Planner, Verifier
│   │   ├── api/              # Dashboard, analyze, planner, actions, solar, context, history
│   │   ├── data/             # Emission factors, solar benchmarks, circular partners, glossary
│   │   ├── database/         # SQLite DB & repositories
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Impact engine, Gemini client, solar simulator, forecast
│   ├── tests/                # Automated test suite (9/9 passed)
│   ├── requirements.txt      # Backend Python dependencies
│   ├── .env.example          # Public environment configuration template
│   └── pytest.ini            # Pytest configuration
│
├── frontend/                 # React 18 / TypeScript / Vite Application
│   ├── src/
│   │   ├── components/       # Reusable components preserving your supplied design
│   │   │   ├── layout/       # Navbar, Footer
│   │   │   ├── dashboard/    # Hero, MetricCards, ScoreGauge
│   │   │   ├── upload/       # UploadHub (Waste, Fridge, Bills, Commute)
│   │   │   ├── solar/        # SolarPanel simulator
│   │   │   ├── actions/      # ActionStream (Checklists & Negotiator cards)
│   │   │   ├── agents/       # AgentTraceDrawer (Visible pipeline trace)
│   │   │   └── modals/       # ScannerModal, AutopilotModal, LocationModal, HistoryModal
│   │   ├── services/         # API client
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── index.css         # Glassmorphism, animations & design tokens
│   │   └── App.tsx           # Main application component
│   ├── package.json          # Frontend dependencies (lucide-react, recharts, etc.)
│   └── vite.config.ts        # Vite config with backend API proxy (/api -> :8000)
│
├── .gitignore                # Excludes secrets, databases, venvs, and build artifacts
├── package.json              # Root package script runner
└── README.md                 # Project documentation
```

---

## 🏃 Quick Start Guide

### 1. Backend Setup (FastAPI & Python 3.11+)
```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate.ps1
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup (React, Vite, TypeScript)
```bash
cd frontend
npm install
npm run dev
```

### 3. Automated Test Suite
```bash
cd backend
.\.venv\Scripts\pytest tests\test_ecotwin.py -v
```