# EcoTwin — AI Planet Budget Platform

> **"Your Planet Budget, run by an AI Autopilot."**
> A full-stack sustainability platform treating everyday environmental impact like a personal-finance budget with cooperating Gemini AI agents.

---

## 🚀 Live Demo URLs

- **Frontend (React + Vite + TypeScript + Three.js):** [http://localhost:5173](http://localhost:5173)
- **Backend (FastAPI + Python 3.11+ + Gemini Live):** [http://localhost:8000](http://localhost:8000)
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
* **RouterAgent:** Inspects multimodal input (text, photo, webcam capture, utility bill, voice transcript) and routes to specialists with confidence scoring.
* **WasteRecyclingAgent:** Identifies item polymer composition, municipal segregation rules (BBMP, DWCC), and landfill diversion impact.
* **FoodWasteGuardAgent:** Scans fridge items and grocery receipts, highlights perishables nearing expiry, and generates zero-waste batch cooking recipes.
* **EnergyAuditorAgent & BillAgent:** Parses utility power bills (BESCOM, TSSPDCL, MSEDCL, etc.), benchmarks against neighborhood targets, and prioritizes peak solar load-shifting.
* **MobilityNegotiatorAgent:** Multimodal transit comparison (Metro vs Bus vs Solo car vs EV) balancing carbon vs time vs fare cost for 6 major metropolitan regions.
* **ProductSustainabilityAgent:** Audits packaging recyclability, greenwashing claims, and refill alternatives.
* **CircularExchangeAgent:** Connects users with verified local circular recovery hubs (Hasiru Dala, Saahas, Goonj).
* **NegotiatorAgent:** Reconciles sustainability vs convenience trade-offs with transparent justification.
* **PlannerAgent:** Synthesizes planetary budgets, weather/AQI context, and household needs into a weekly action plan (**Planetary Alignment Plan: Week 1**).
* **VerifierAgent:** Audits output against schemas, boundary constraints, and consistency rules.
* **Visible Agent Trace Drawer:** Real-time collapsible drawer displaying step-by-step agent reasoning logs and execution timestamps.

### 3. Interactive 3D Earth Digital Twin
* **WebGL Celestial Canvas:** Interactive 3D Earth globe rendered via Three.js with realistic surface maps, specular oceans, and cloud layers reflecting real-time planetary health.

### 4. Interactive Simulator & Circular Hub Locator
* **Digital Twin Simulator Modal:** Interactive what-if scenario forecasting with sliders for plant-based days, public transit share, rooftop solar capacity, and cooling setpoints.
* **Circular Facility Map:** Search and locate verified local circular economy hubs, e-waste drop-offs, and composting centers.
* **Verifiable Sustainability Certificate:** Generates downloadable, tamper-verifiable certificates validating planet score, diverted waste, and avoided emissions.

### 5. Multimodal Voice Assistant & Multilingual UI
* **Speech-to-Text Voice Agent:** Hands-free logging via microphone, transcribing spoken actions directly into agent tasks.
* **Regional Languages:** Full dual-language localization supporting English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Telugu (తెలుగు), Tamil (தமிழ்), Marathi (मराठी), and Malayalam (മലയാളം).

### 6. Deterministic Impact & Solar Engine
* **No LLM arithmetic hallucination:** All emissions and savings are calculated in Python using verified factors (`emission_factors.json`, CEA Baseline Database, IPCC, and MNRE benchmark grid mix).
* **Rooftop Solar PV Simulator:** Area-based sizing calculator (sq ft to kW) computing annual clean generation, ₹ savings, payback period, and trees equivalent.

---

## 📁 Repository Structure

```
EcoTwin/
├── backend/                  # Python 3.11+ / FastAPI Server
│   ├── app/                  # Multi-agent pipelines, routes, impact models
│   │   ├── agents/           # Router, Waste, Food, Energy, Mobility, Bill, Circular, Negotiator, Planner, Verifier
│   │   ├── api/              # Dashboard, analyze, planner, actions, solar, context, history
│   │   ├── data/             # Emission factors, solar benchmarks, circular partners, glossary
│   │   ├── database/         # SQLite DB, migrations & repositories
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Impact engine, Gemini client, solar simulator, forecast
│   ├── tests/                # Automated test suite (9/9 passed)
│   ├── requirements.txt      # Backend Python dependencies
│   ├── .env.example          # Public environment configuration template
│   └── pytest.ini            # Pytest configuration
│
├── frontend/                 # React 18 / TypeScript / Vite Application
│   ├── src/
│   │   ├── components/       # Component architecture
│   │   │   ├── layout/       # Navbar, Footer
│   │   │   ├── dashboard/    # Hero, MetricCards, ScoreGauge
│   │   │   ├── upload/       # UploadHub (Waste, Fridge, Bills, Commute)
│   │   │   ├── solar/        # Rooftop Solar PV Area Simulator
│   │   │   ├── actions/      # ActionStream (Checklists & Trade-off cards)
│   │   │   ├── agents/       # AgentTraceDrawer (Live reasoning trace)
│   │   │   ├── voice/        # Multimodal Voice Assistant modal
│   │   │   ├── simulator/    # Digital Twin What-If Scenario Simulator
│   │   │   ├── map/          # Circular Economy Hubs Locator
│   │   │   ├── certificate/  # Sustainability Certificate modal
│   │   │   └── modals/       # ScannerModal (Photo/Webcam), AutopilotModal (Week 1), LocationModal
│   │   ├── i18n/             # Regional language translations
│   │   ├── services/         # API client
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── index.css         # Glassmorphism & custom styling
│   │   └── App.tsx           # Main application component
│   ├── public/textures/      # Three.js high-resolution Earth textures
│   ├── package.json          # Frontend dependencies (three, lucide-react, recharts, etc.)
│   └── vite.config.ts        # Vite configuration with backend API proxy
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