# CampusPulse AI – Intelligent College Feedback Analyzer

An intelligent, production-ready campus feedback telemetry and AI triage web application. Built from the ground up matching the Arena UI design specifications, powered by a **React + Tailwind CSS** frontend, a **Python FastAPI** backend, **SQLAlchemy** database persistence, and a **multilingual AI/NLP pipeline** supporting **English, Hindi (हिंदी), and Marathi (मराठी)**.

---

## 🌟 Key Features

### 1. 🎓 Student Feedback Portal
- **Multilingual Input & UI**: Full native support for **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** with localized interface strings and quick-test prompts.
- **Real-Time Live AI Preview**: As the student types their response, a debounced live preview analyzes tone, sentiment polarity, category, urgency, emotion, and target SLA before submission.
- **Privacy & Anonymity**: 1-click toggle for anonymous submissions where names and email addresses are omitted while preserving critical issue routing.
- **Interactive Rating System**: 5-star rating with dynamic hover descriptions and score weighting.
- **Visual Triage Pipeline**: Multi-stage animation on submit (*Reading feedback & detecting language* → *Analyzing sentiment & emotion* → *Categorizing domain* → *Scoring urgency & safety priority* → *Assigning SLA & routing*).
- **Confirmation Receipt**: Provides a unique ticket reference ID (e.g. `CP-1045`), sentiment badge, priority indicator, SLA target, and designated department owner.

### 2. 🏛️ Admin Command Center
- **Executive Overview**:
  - 4 Key Metric Cards (Total Feedback, Sentiment Index, Open Critical Issues, Resolution Rate) with 14-day delta trends.
  - Interactive **Weekly Sentiment Trend** area chart.
  - **Sentiment Split** donut chart with hover tooltips.
  - **Top Complaint Categories** bar chart.
  - **Priority Detection** distribution meters (Critical, High, Medium, Low).
  - **AI Insights**: Auto-generated summaries highlighting high-risk areas, positive benchmarks, and emerging trends.
  - **Needs Attention Now**: Real-time list of unresolved critical/high grievances with 1-click drawer inspection.
- **Issue Tracker (Table & Kanban Board)**:
  - **Table View**: Paginated list with ID, department, student name, language badge, category, sentiment badge, priority badge, status badge, assignee, and relative age.
  - **Kanban Board**: Drag/click cards categorized under *Open*, *In Progress*, and *Resolved*.
  - **Multi-Filter System**: Filter simultaneously by Status, Priority, Category, Department, Language (EN, HI, MR), and Demo vs. Real submissions.
  - **Full-Text Search**: Live keyword search across ticket IDs, feedback text, student names, and AI summaries.
  - **Slide-over Ticket Detail Drawer**: Inspect full student text, AI classification drivers, urgency meter (0-100), emotion, keywords, update status, re-assign owner to any campus team, and add internal administrative audit notes.
- **Analytics & Telemetry**:
  - Feedback volume vs. sentiment index composed chart (bars + trendline).
  - Sentiment by category stacked bar chart.
  - Category health radar chart.
  - Dominant emotion distribution chart (*Delighted*, *Satisfied*, *Constructive*, *Neutral*, *Disappointed*, *Frustrated*, *Fearful*).
  - Star rating distribution (1 to 5 stars).
  - Detected keyword cloud with positive/negative filtering.
  - Department × Category negative feedback heat map.
- **Department Scorecards & Ranking**:
  - Horizontal bar chart of department sentiment index (0–100).
  - Detailed departmental scorecard table with report volume, critical count, resolution rate, and top recurring issue.
  - Circular SVG health score rings for each academic department.
  - Single-department drilldown view with departmental category chart and unresolved issues.
- **Reports & Multi-Format Exports**:
  - **PDF Export** using `jsPDF` and `jspdf-autotable`: Executive summary, Department report, Critical issues log, and Full issue tracker table.
  - **Excel / CSV Export** with UTF-8 BOM encoding for flawless rendering of English, Hindi, and Marathi characters in Microsoft Excel, Apple Numbers, and Google Sheets.
  - Scheduled delivery configuration preview (Weekly digest, Critical alerts, Monthly board report).

### 3. 🧠 Multilingual AI/NLP Engine
- **Language Detection**: Automatically distinguishes English, Hindi (Devanagari), Marathi (Devanagari), and Romanized/transliterated scripts (Hinglish/Marathlish).
- **Sentiment Polarity**: Lexicon and context-aware mathematical scoring normalized between `-1.0` and `+1.0`, taking into account negations, intensifiers, and student rating weighting.
- **11 Domain Categories**: Academics, Faculty, Infrastructure, Hostel, Canteen, Transport, Library, IT & Wi-Fi, Administration, Safety, General.
- **Safety & Critical Detection**: Immediate escalation to **Critical** priority (4-hour SLA) for keywords related to harassment, ragging, safety hazards, food poisoning, fire/electric risks, or physical violence.
- **Emotion Recognition**: Identifies student sentiment state (*Delighted*, *Satisfied*, *Constructive*, *Neutral*, *Disappointed*, *Frustrated*, *Fearful*).
- **Actionable Routing**: Maps each category to standard remediation actions, responsible department owners, and SLAs.

### 4. 🔒 Role-Based Access Control & Security
- Secure JWT-based authentication (`HS256`).
- PBKDF2-HMAC-SHA256 password hashing with unique 16-byte cryptographic salts.
- Roles: `admin` (can modify ticket status, assignees, admin notes, and demo datasets) and `student`.
- **Pre-seeded Admin Account**: `admin@campuspulse.edu` / `admin123`.
- **1-Click Quick Demo Login** buttons for easy testing.

### 5. 🗄️ Database & Demo Data Separation
- Built on **SQLAlchemy ORM** with default SQLite (`campuspulse.db`) for zero-configuration local runs, and ready for PostgreSQL in production.
- **Clean separation** between sample demo seed data (`is_demo = True`) and real student responses (`is_demo = False`).
- Admin toggle pills: *All Data*, *Real Feedback Only*, and *Demo Data Only*.
- Admin actions to **Reset Demo Data** or **Clear Demo Data** leaving only authentic feedback.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, jsPDF, jspdf-autotable, Vite |
| **Backend** | Python 3.14+, FastAPI, Uvicorn, Pydantic v2, Python-Jose (JWT), Passlib/hashlib |
| **Database** | SQLite (Default, zero-setup) / PostgreSQL (via SQLAlchemy 2.0) |
| **AI / NLP** | Multilingual Sentiment, Urgency & Category Engine (English, Hindi, Marathi) |
| **Exports** | PDF (Executive, Department, Critical, Issues) & UTF-8 BOM CSV/Excel |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+ or v20+)
- **Python** (v3.10+)

---

### Method 1: Unified Launcher (Recommended)

Run the unified Python launcher to start both backend and frontend concurrently:

```bash
python start.py
```

This launches:
- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Method 2: Windows Batch Files

Double-click or run from terminal:
- `start_backend.bat` (Starts FastAPI server on port 8000)
- `start_frontend.bat` (Starts Vite React development server on port 5173)

---

### Method 3: Manual Startup

#### Step 1: Start Backend
```bash
cd backend
python -m venv venv           # optional
# venv\Scripts\activate       # on Windows
pip install -r requirements.txt
python run.py
```
*Backend runs on `http://localhost:8000` with SQLite database `campuspulse.db` auto-created and seeded.*

#### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔐 Credentials for Testing

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Administrator / Dean** | `admin@campuspulse.edu` | `admin123` | Full access: View all telemetry, change ticket status, reassign tickets, write admin notes, reset/clear demo data, export PDF & Excel reports. |
| **Student** | `student@campuspulse.edu` | `student123` | Student portal submission with profile pre-fill, history, and named feedback. |
| **Guest / Anonymous** | *None required* | *None* | 100% anonymous submission without logging in. |

*Note: The Sign In modal includes **1-click quick login buttons** for instant evaluation.*

---

## 🌐 Sample Multilingual Prompts for Testing

Try submitting these via the Student Portal (`#/feedback`) or the Live Demo on the Landing Page (`#/`):

### 🇬🇧 English:
1. **Critical Safety**:
   > *"A group of seniors is harassing juniors near the hostel block every night. We feel unsafe and nobody is taking action."*
   > → **Result**: Safety, Critical Priority, 4-Hour SLA, Routed to Security Office.
2. **Infrastructure**:
   > *"The Wi-Fi in the hostel has been down for two weeks. We cannot attend online classes or submit assignments."*
   > → **Result**: IT & Wi-Fi, High Priority, Routed to IT Services.
3. **Appreciation**:
   > *"Prof. Mehta explains complex topics so clearly. Her doubt-clearing sessions are really helpful and engaging."*
   > → **Result**: Faculty, Positive, Low Priority, Commendation logged.

### 🇮🇳 Hindi (हिंदी):
1. **Critical Safety**:
   > *"हॉस्टल के पास कुछ छात्र देर रात तक रैगिंग करते हैं। हम बहुत डरे हुए हैं और सुरक्षा गार्ड कुछ नहीं कर रहे।"*
   > → **Result**: Safety (सुरक्षा), Critical Priority, Fearful emotion, Routed to Security Office.
2. **Hostel & Mess**:
   > *"मेस के खाने में कीड़े निकले हैं और कई छात्र बीमार पड़ गए हैं। तुरंत रसोई का निरीक्षण किया जाए।"*
   > → **Result**: Canteen/Mess, Critical Priority, Routed to Mess Committee.
3. **Academics / Appreciation**:
   > *"कंप्यूटर साइंस विभाग के प्रोफेसर बहुत अच्छा पढ़ाते हैं और प्रैक्टिकल में पूरा सहयोग करते हैं। बहुत अच्छा माहौल है।"*
   > → **Result**: Academics/Faculty, Positive, Commendation logged.

### 🇮🇳 Marathi (मराठी):
1. **Critical Safety**:
   > *"वसतिगृहाजवळ रात्रीच्या वेळी रॅगिंग आणि गैरवर्तन सुरू असते, विद्यार्थ्यांमध्ये भीतीचे वातावरण आहे आणि सुरक्षारक्षक दुर्लक्ष करत आहेत."*
   > → **Result**: Safety, Critical Priority, Routed to Security Office.
2. **Hostel & Water Issue**:
   > *"वसतिगृहात गेल्या आठवड्यापासून पिण्याच्या पाण्याची तीव्र टंचाई आहे आणि स्वच्छतागृहांमध्ये पाणी नसल्यामुळे दुर्गंधी पसरली आहे."*
   > → **Result**: Hostel/Infrastructure, High Priority, Routed to Hostel Administration.
3. **Appreciation**:
   > *"प्राध्यापक देशपांडे यांचे व्याख्यान अतिशय उत्तम आणि माहितीपूर्ण असते. सर्व संकल्पना सहज स्पष्ट होतात. धन्यवाद!"*
   > → **Result**: Faculty, Positive, Low Priority.

---

## 📁 Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI app, CORS, lifespan startup & seed
│   │   ├── config.py              # App settings, JWT parameters, DB URL
│   │   ├── database.py            # SQLAlchemy engine, session maker
│   │   ├── models.py              # User and Feedback ORM models
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── auth.py                # JWT auth, PBKDF2 password hashing & RBAC
│   │   ├── nlp_engine.py          # Multilingual NLP analysis engine (EN, HI, MR)
│   │   ├── seed_data.py           # Realistic multilingual demo seed generator
│   │   └── routes/
│   │       ├── auth_routes.py     # Login, Register, Profile endpoints
│   │       ├── feedback_routes.py # Submit, Live-analyze, List, Status, Notes
│   │       ├── analytics_routes.py# KPIs, Trends, Departments, Emotions
│   │       └── export_routes.py   # UTF-8 BOM CSV / Excel download
│   ├── requirements.txt           # Python dependencies
│   ├── run.py                     # Backend entry point
│   └── .env                       # Backend environment configuration
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # App shell, routing, auth & store providers
│   │   ├── main.tsx               # React DOM entrypoint
│   │   ├── index.css              # Tailwind v4 styles, custom animations
│   │   ├── types.ts               # Core TypeScript models and constants
│   │   ├── lib/
│   │   │   ├── api.ts             # Backend API client with offline fallback
│   │   │   ├── auth.tsx           # Authentication Context & role state
│   │   │   ├── store.tsx          # Real-time data store with demo filter
│   │   │   ├── nlp_engine.ts      # Client-side NLP analyzer for offline mode
│   │   │   ├── i18n.ts            # Multilingual dictionaries (EN, HI, MR)
│   │   │   ├── pdf.ts             # jsPDF export generator (4 report types)
│   │   │   ├── excel.ts           # UTF-8 BOM CSV / Excel generator
│   │   │   └── metrics.ts         # Chart aggregators & KPI calculations
│   │   ├── components/
│   │   │   ├── ui.tsx             # Badges, cards, logos, rating stars, tooltips
│   │   │   ├── AnalysisPanel.tsx  # Live AI assessment panel with score meter
│   │   │   ├── AuthModal.tsx      # Sign In / Register dialog with quick login
│   │   │   └── IssueDetailDrawer.tsx # Slide-over ticket inspection & actions
│   │   └── pages/
│   │       ├── Landing.tsx        # Hero, interactive demo, features, testimonials
│   │       ├── FeedbackPage.tsx   # Student feedback portal (multilingual)
│   │       └── admin/
│   │           ├── AdminLayout.tsx# Admin navigation, health indicator, filters
│   │           ├── Overview.tsx   # Real-time KPIs, charts, priority meters
│   │           ├── Issues.tsx     # Issue tracker (Table & Kanban views)
│   │           ├── Departments.tsx# Department scorecards & rankings
│   │           ├── Analytics.tsx  # Sentiment trends, radar, emotions, heat map
│   │           └── Reports.tsx    # PDF & Excel export dashboard
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── start.py                       # Unified concurrent launcher
├── start_backend.bat              # 1-click Windows backend launcher
├── start_frontend.bat             # 1-click Windows frontend launcher
├── .env.example                   # Sample environment configuration
└── README.md                      # Comprehensive documentation
```

---

## 🛡️ License

Built for institutional education governance and student voice intelligence. All rights reserved.
