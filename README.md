# 🏙️ Smart City Governance & Complaint Management System
### Real-Time Civic Grievance Redressal, Multi-Modal Issue Detection & AI Department Dispatch

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.112-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B%20%7C%203.11-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47a248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Installation & Setup (Fresh System)](#-step-by-step-installation--setup-fresh-system)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Configure Environment Variables](#step-2-configure-environment-variables)
  - [Step 3: Install Node.js Dependencies](#step-3-install-nodejs-dependencies-frontend--backend)
  - [Step 4: Setup Python AI/ML Service & Train Model](#step-4-setup-python-aiml-service--train-model)
  - [Step 5: Start MongoDB](#step-5-start-mongodb)
  - [Step 6: Run the Application](#step-6-run-the-application)
- [Alternative: 1-Command Docker Setup](#-alternative-1-command-docker-setup)
- [Default Demo Credentials & Pre-seeded Data](#-default-demo-credentials--pre-seeded-data)
- [Verification & Health Checks](#-verification--health-checks)
- [Directory Structure](#-directory-structure)
- [API Reference](#-api-reference)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [Production Build](#-production-build)

---

## 🌟 Overview

The **Smart City Governance System** is a next-generation, production-ready civic issue tracking, triage, and resolution platform designed for citizens, field officers, department heads, and municipal administrators.

Equipped with a **FastAPI Machine Learning NLP Service**, complaints are automatically analyzed upon submission to predict category, assign responsible government departments (Public Works, Electricity, Sanitation, Water Supply, Drainage, etc.), and determine SLA priority in real time.

---

## ✨ Key Features

- 👥 **Role-Based Portals & Dashboards**: Dedicated workspaces for **Citizens**, **Ward Officers**, **Department Heads**, and **System Administrators**.
- 🤖 **AI-Powered Grievance Triage**: Automated NLP classification (TF-IDF + Logistic Regression) for issue category, responsible department routing, and priority detection with resilient fallback rule matching.
- 📍 **Interactive Civic Map**: Live visual telemetry of complaints across municipal wards with status markers (Resolved, In Progress, Pending).
- 📸 **Multi-Modal Issue Reporting**: Instant GPS auto-location detection, camera photo capture, image preview, voice-assisted typing, and quick template selection.
- ⏱️ **End-to-End Resolution Lifecycle**: Real-time timeline tracking from ticket submission, ML classification, officer assignment, to field resolution and citizen verification.
- ⚡ **1-Click Instant Demo Login**: Built-in credential presets on the login page for instantaneous testing across all 4 system roles without manual registration.
- 🌙 **Modern Glassmorphism UI**: High-fidelity dark mode & light mode responsive interface built with Tailwind CSS, Lucide Icons, Framer Motion, and Recharts.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Client (React/Vite)    │
                                  │    http://localhost:5173    │
                                  └──────────────┬──────────────┘
                                                 │ HTTP / REST
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     Server (Express/Node)   │
                                  │    http://localhost:5000    │
                                  └──────┬───────────────┬──────┘
                                         │               │
                     ┌───────────────────┘               └───────────────────┐
                     ▼                                                       ▼
      ┌─────────────────────────────┐                         ┌─────────────────────────────┐
      │      Database (MongoDB)     │                         │   ML Service (FastAPI/Py)   │
      │    mongodb://localhost:27017│                         │    http://localhost:8000    │
      └─────────────────────────────┘                         └─────────────────────────────┘
```

---

## 📋 Prerequisites

Before installing the project on a new machine, ensure you have the following installed:

| Tool | Version Requirement | Download Link |
|---|---|---|
| **Node.js** | `v18.x` or `v20.x`+ (LTS recommended) | [nodejs.org](https://nodejs.org/) |
| **npm** | `v9.x` or `v10.x`+ (comes with Node.js) | — |
| **Python** | `3.10.x` or `3.11.x` (with `pip`) | [python.org](https://www.python.org/downloads/) |
| **MongoDB** | Local MongoDB Community Server `v6.0+` / `v7.0+` OR free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Cloud Cluster | [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) |
| **Git** | `v2.x+` | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Step-by-Step Installation & Setup (Fresh System)

Follow these exact steps after cloning the repository onto any new Windows, macOS, or Linux machine.

### Step 1: Clone the Repository

Open your terminal (PowerShell, Command Prompt, or Bash) and run:

```bash
git clone https://github.com/PriyadarshanLG/SMART-CITY-GOVERNANCE-SYSTEM-WITH-REAL-TIME-MULTI-MODAL-ISSUE-DETE.git
cd SMART-CITY-GOVERNANCE-SYSTEM-WITH-REAL-TIME-MULTI-MODAL-ISSUE-DETE
```

---

### Step 2: Configure Environment Variables

The project contains pre-configured `.env.example` templates. Create the `.env` files for the root, backend, and frontend:

#### Option A — On Windows (PowerShell):
```powershell
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

#### Option B — On macOS / Linux (Bash):
```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

#### Environment Variable Summary:

- **`server/.env`**:
  ```env
  NODE_ENV=development
  PORT=5000
  CLIENT_URL=http://localhost:5173
  MONGODB_URI=mongodb://127.0.0.1:27017/smartcity
  JWT_ACCESS_SECRET=smartcity_super_secret_access_key_2026_jwt
  JWT_REFRESH_SECRET=smartcity_super_secret_refresh_key_2026_jwt
  JWT_ACCESS_EXPIRES_IN=1d
  JWT_REFRESH_EXPIRES_IN=7d
  ML_API_URL=http://localhost:8000
  ```
  *(Note: If using **MongoDB Atlas**, replace `MONGODB_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/smartcity`).*

- **`client/.env`**:
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

---

### Step 3: Install Node.js Dependencies (Frontend & Backend)

From the project root directory, install all dependencies for both `server` and `client` using npm workspaces:

```bash
npm install
```

> **Manual alternative**: You can also install dependencies inside each folder independently:
> ```bash
> cd server && npm install && cd ..
> cd client && npm install && cd ..
> ```

---

### Step 4: Setup Python AI/ML Service & Train Model

The ML microservice provides automated grievance categorization, department allocation, and priority scoring.

1. **Navigate to the `ml` directory**:
   ```bash
   cd ml
   ```

2. **Create a Python Virtual Environment**:
   - **Windows (PowerShell / CMD)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
     *(If PowerShell gives a script execution error, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and re-run activate).*
   - **macOS / Linux (Bash)**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Train the ML Model**:
   Execute the training script once to generate the scikit-learn model artifact in `ml/artifacts/model.joblib`:
   ```bash
   python train.py
   ```
   *Output:* `Saved model artifact to artifacts/model.joblib`

5. **Return to the project root**:
   ```bash
   cd ..
   ```

---

### Step 5: Start MongoDB

Make sure your MongoDB server is running:

- **Local MongoDB (Windows Service)**: MongoDB usually runs automatically as a Windows Service. You can verify in PowerShell:
  ```powershell
  Get-Service MongoDB
  ```
- **Local MongoDB (Manual start)**:
  ```bash
  mongod --dbpath <path-to-your-db-folder>
  ```
- **MongoDB Atlas**: If using MongoDB Atlas cloud URI in `server/.env`, ensure your current IP address is whitelisted in your Atlas Network Access settings.

---

### Step 6: Run the Application

You can run all three services simultaneously.

#### Method A: Multi-Terminal Run (Recommended for Development)

Open **3 separate terminal windows**:

##### 🟢 Terminal 1 — Python ML Service:
```bash
cd ml
# Activate venv first:
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
*ML Service will be running at:* `http://127.0.0.1:8000` (Swagger UI: `http://127.0.0.1:8000/docs`)

##### 🟢 Terminal 2 — Node.js Backend Server:
```bash
cd server
npm run dev
```
*Backend API will be running at:* `http://localhost:5000`  
*(On first startup, it will automatically connect to MongoDB and seed default demo accounts and sample complaints).*

##### 🟢 Terminal 3 — React Frontend Portal:
```bash
cd client
npm run dev
```
*Frontend Web Application will be available at:* `http://localhost:5173`

---

#### Method B: Root Concurrently Script (Client + Server together)

From the project root:
```bash
# In Terminal 1 (Runs both Backend on :5000 and Frontend on :5173):
npm run dev

# In Terminal 2 (Runs Python ML Service):
cd ml
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

---

## 🐳 Alternative: 1-Command Docker Setup

If you have **Docker** and **Docker Compose** installed, you can start the entire stack (MongoDB, Python ML Service, Express Backend, and React Client) with a single command:

```bash
docker-compose up --build
```

- **Frontend Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **ML Service**: `http://localhost:8000`
- **MongoDB**: `localhost:27017`

To stop the containers:
```bash
docker-compose down
```

---

## 🔑 Default Demo Credentials & Pre-seeded Data

When the backend connects to MongoDB for the first time, it **automatically seeds 4 sample user accounts** and realistic civic grievance tickets with complete lifecycle histories.

| Role | Demo Email | Password | Permissions & Features |
|---|---|---|---|
| 👤 **Citizen** | `citizen@smartcity.gov.in` | `Password@123` | Report complaints, GPS tagging, photo upload, personal dashboard, upvote issues, verify resolutions |
| 👷 **Government Officer** | `officer@smartcity.gov.in` | `Password@123` | Ward task queue, update status (*Work In Progress*, *Resolved*), add inspection notes |
| 📊 **Department Head** | `depthead@smartcity.gov.in` | `Password@123` | Department grievance analytics, officer workload allocation, SLA monitoring |
| ⚙️ **System Admin** | `admin@smartcity.gov.in` | `Password@123` | City-wide dashboard, ward management, full ticket database access, system telemetry |

> 💡 **Quick Login Tip**: You can click any of the **"⚡ 1-Click Instant Demo Login"** buttons on the [`/login`](http://localhost:5173/login) page to instantly sign in without typing passwords!

---

## 🩺 Verification & Health Checks

Once the services are running, verify that each layer is operational:

| Service | Test URL | Expected Response |
|---|---|---|
| **Frontend Portal** | `http://localhost:5173` | Smart City landing page and interactive portal UI |
| **Backend Health** | `http://localhost:5000/api/health` | `{"status":"ok","timestamp":"..."}` |
| **Complaints Stats** | `http://localhost:5000/api/complaints/stats/summary` | JSON containing counts of total, resolved, pending, and category aggregates |
| **ML Health** | `http://localhost:8000/health` | `{"status":"ok","service":"smart-city-ml"}` |
| **ML API Docs** | `http://localhost:8000/docs` | Interactive Swagger OpenAPI documentation |

---

## 📁 Directory Structure

```
smart-city-governance-system/
├── client/                     # Frontend React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Reusable UI components & layouts (Navbar, Footer, Assistant)
│   │   ├── context/            # AuthContext (JWT authentication state management)
│   │   ├── lib/                # Axios API client instance & helper utilities
│   │   ├── pages/              # Pages:
│   │   │   ├── LandingPage.tsx        # Hero portal, live statistics & civic features
│   │   │   ├── HomePage.tsx           # Public grievance feed & interactive ward map
│   │   │   ├── ComplaintFormPage.tsx  # Multi-modal grievance reporting form with AI assist
│   │   │   ├── ComplaintDetailsPage.tsx # Issue timeline, updates & citizen verification
│   │   │   ├── DashboardPage.tsx      # Role-based workspace (Citizen/Officer/DeptHead/Admin)
│   │   │   ├── LoginPage.tsx          # Authentication with 1-click instant role selectors
│   │   │   └── RegisterPage.tsx       # New citizen registration
│   │   ├── styles/             # Global CSS and custom design tokens
│   │   ├── App.tsx             # React Router routing configuration
│   │   └── main.tsx            # React application entrypoint
│   ├── .env.example            # Frontend environment variable template
│   ├── package.json            # Frontend npm dependencies
│   ├── tailwind.config.ts      # Tailwind styling configuration
│   └── vite.config.ts          # Vite build and dev configuration
│
├── server/                     # Backend Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Database connection, env validation & seedData.ts
│   │   ├── middleware/         # Auth verification, rate limiting, error handlers
│   │   ├── models/             # Mongoose schemas (User, Complaint)
│   │   ├── routes/             # Express route handlers (/auth, /complaints, /health)
│   │   ├── services/           # ML classification client & complaint ID generators
│   │   ├── utils/              # JWT token generation and password hashing
│   │   ├── server.ts           # Express application initialization & middleware setup
│   │   └── index.ts            # Server entrypoint and MongoDB bootstrap
│   ├── .env.example            # Backend environment variable template
│   ├── package.json            # Backend npm dependencies & scripts
│   └── tsconfig.json           # TypeScript server compiler configuration
│
├── ml/                         # Python AI/ML Classification Microservice
│   ├── artifacts/              # Serialized trained models (model.joblib)
│   ├── data/                   # Training datasets (sample_complaints.csv)
│   ├── app.py                  # FastAPI application with /predict and /health endpoints
│   ├── classifier.py           # NLP predictor with fallback keyword rule engine
│   ├── train.py                # Scikit-learn TF-IDF + Logistic Regression training pipeline
│   ├── Dockerfile              # Container definition for ML service
│   └── requirements.txt        # Python dependencies (FastAPI, scikit-learn, pandas, etc.)
│
├── .env.example                # Global environment variables template
├── docker-compose.yml          # Multi-container orchestration (Mongo, ML, Server, Client)
├── package.json                # Monorepo root workspace configuration
└── README.md                   # Complete system documentation & setup guide
```

---

## 📡 API Reference

### Backend Endpoints (`http://localhost:5000/api`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user account (Citizen / Officer / Admin) |
| `POST` | `/auth/login` | Authenticate user and obtain JWT access & refresh tokens |
| `GET` | `/complaints` | Search, filter (status, ward, category, dept), and paginate complaints |
| `GET` | `/complaints/stats/summary`| Aggregate municipal metrics (Total, Resolved, Pending, SLA, Category distribution) |
| `GET` | `/complaints/:id` | Fetch specific complaint by ID or tracking code (e.g., `SC-2026-000001`) |
| `POST` | `/complaints` | Submit a new grievance (triggers ML classifier & assigns department) |
| `POST` | `/complaints/:id/support`| Upvote / record community support for an issue |
| `PATCH`| `/complaints/:id/status` | Update complaint status and append timeline progress notes |
| `GET` | `/health` | Health check endpoint |

### ML Microservice Endpoints (`http://localhost:8000`)

| Method | Endpoint | Payload | Description |
|---|---|---|---|
| `GET` | `/health` | — | Health check and service status |
| `POST` | `/predict` | `{"title": "...", "description": "..."}` | Returns predicted `{category, department, priority}` |
| `GET` | `/docs` | — | Interactive Swagger OpenAPI documentation |

---

## 🛠️ Troubleshooting & FAQs

### 1. MongoDB Connection Error (`MongooseServerSelectionError`)
- **Cause**: MongoDB is not running locally or the connection string is incorrect.
- **Fix**:
  - Check if local MongoDB is running: `mongod` or verify Windows service status.
  - If using MongoDB Atlas, check that `MONGODB_URI` in `server/.env` includes valid credentials and that your IP address is whitelisted in Atlas Network Access.

### 2. Python Virtual Environment Activation Error (Windows PowerShell)
- **Cause**: Windows PowerShell default script execution policy restricts running `.ps1` scripts.
- **Fix**:
  Run PowerShell as Administrator and execute:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\venv\Scripts\activate
  ```
  Or use standard Command Prompt (`cmd.exe`): `.\venv\Scripts\activate.bat`.

### 3. Port Already in Use (`EADDRINUSE: 5000` / `5173` / `8000`)
- **Fix**:
  - Check what process is occupying the port:
    - **Windows**: `netstat -ano | findstr :5000` followed by `taskkill /PID <PID> /F`
    - **macOS / Linux**: `lsof -i :5000` followed by `kill -9 <PID>`
  - Alternatively, change the port in `.env` and `client/.env`.

### 4. ML Model Artifact Not Found
- **Fix**: Run `python train.py` inside the `ml/` folder to build the `artifacts/model.joblib` artifact. Even without the artifact, the server contains a built-in keyword rule fallback to ensure uninterrupted workflow.

### 5. CORS or Network Request Errors on Frontend
- **Fix**: Ensure `VITE_API_URL` in `client/.env` points to `http://localhost:5000/api` and that `CLIENT_URL` in `server/.env` is set to `http://localhost:5173`.

---

## 📦 Production Build

To build both the backend TypeScript server and frontend React client for production deployment:

```bash
# Build all workspaces
npm run build

# Start production server
cd server
npm run start
```

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for educational, municipal, or enterprise purposes.
