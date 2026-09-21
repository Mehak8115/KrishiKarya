# Krishi Karya 🌾

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Frontend](https://img.shields.io/badge/Frontend-ES6%20Modules%20%7C%20CSS3-F7DF1E.svg?style=flat&logo=javascript&logoColor=black)](frontend/)

**Krishi Karya** is an AI-enabled agricultural procurement platform designed to bridge the gap between Indian farmers and retail/institutional buyers. By bypassing traditional intermediaries, Krishi Karya enables transparent pricing, verified direct farm procurement, AI-powered quality assessment, and predictive demand forecasting.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [1. Frontend Setup](#1-frontend-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Database Setup](#3-database-setup)
  - [4. AI Model Service Integration](#4-ai-model-service-integration)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Tech Stack](#-tech-stack)
- [License](#-license)

---

## ✨ Key Features

- 🌾 **Direct Farm-to-Buyer Procurement**: Connect verified farmers directly with retail & bulk procurers with zero middleman commissions.
- 🌐 **Bilingual Interface**: Native support for **English** and **Hindi** with instant runtime language switching.
- 🌙 **Adaptive Dark / Light Theme**: Dynamic UI with OS preference detection and manual toggle support.
- 🔍 **AI Quality Inspection & Grading**: Computer vision integration for crop disease detection, ripeness estimation, and quality grading (Grades A+, A, B, C).
- 📈 **AI Demand & Price Forecasting**: Data-driven crop demand analytics based on region, historical trends, and forecast horizons.
- 🤝 **Smart Farmer Matching**: Recommendation algorithm matching procurers with nearby verified agricultural producers.
- 🛒 **Interactive Marketplace & Cart**: Responsive produce catalog with category filtering, location search, grade filters, sorting, persistent cart, and checkout flow.
- 📊 **Role-Based Dashboards**: Tailored views for Admins, Buyers, and Farmers to manage inventory, track orders, and view market analytics.
- ♿ **Accessibility & Performance**: Mobile-first responsive layout, keyboard accessible, WCAG AA compliant contrast, aria attributes, and reduced-motion support.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([User / Browser])
    
    subgraph Frontend ["Frontend (Static SPA)"]
        UI["Vanilla JS + ES Modules + CSS3"]
        I18N["i18n Manager (EN / HI)"]
        Router["Client Router & View Engine"]
    end

    subgraph Backend ["Backend Service (Port 8001)"]
        FastAPI["FastAPI REST Server"]
        Auth["JWT Auth & Security"]
        ORMLayer["SQLAlchemy 2.0 Async ORM"]
        Proxy["AI Proxy Client (HTTPX)"]
    end

    subgraph External ["Services & Storage"]
        DB[(PostgreSQL Database)]
        AIService["AI Inference Service (Port 8002)"]
        SMTP["Gmail / SMTP Server"]
    end

    User --> UI
    UI --> Router
    UI --> I18N
    Router -->|HTTP REST Requests| FastAPI
    FastAPI --> Auth
    FastAPI --> ORMLayer
    FastAPI --> Proxy
    ORMLayer --> DB
    Proxy -->|REST / Multipart| AIService
    FastAPI -->|Email OTP / Alerts| SMTP
```

---

## 📁 Project Directory Structure

```
krishi-karya-website_claude/
├── frontend/                   # Static Single-Page Application (SPA)
│   ├── index.html              # Main HTML entrypoint
│   ├── css/                    # Custom CSS design system (tokens, utilities, layouts)
│   ├── js/
│   │   ├── app.js              # Client router, state store & render engine
│   │   ├── data.js             # Client data helpers & mock fallbacks
│   │   ├── i18n.js             # English & Hindi translation dictionaries
│   │   ├── icons.js            # SVG icon mapping system
│   │   ├── views/              # Page views (Home, Marketplace, AI Tools, Cart, etc.)
│   │   └── components/         # Reusable UI components (Header, Footer, Modal, Toast)
│   └── dashboard/              # Admin & User Analytics Dashboard views
│
├── backend/                    # FastAPI REST API Backend
│   ├── main.py                 # Application factory, middleware & router inclusion
│   ├── requirements.txt        # Python dependency manifest
│   ├── .env.example            # Environment variables template
│   └── app/
│       ├── config.py           # Pydantic BaseSettings & configuration loader
│       ├── database.py         # SQLAlchemy async engine & session management
│       ├── models/             # SQLAlchemy ORM database models
│       ├── schemas/            # Pydantic request & response validation schemas
│       └── routers/            # Modular route handlers (Auth, Produce, AI, Orders, etc.)
│
├── database/                   # Database Scripts & Schema Definitions
│   ├── schema.sql              # PostgreSQL DDL table definitions & indexes
│   ├── seed.sql                # Initial seed data (Farmers, Produce listings, Admin)
│   └── README.md               # Database setup documentation
│
└── datasets/                   # Sample datasets & uploaded inspection assets
    └── uploaded_inspections/   # Uploaded crop inspection image assets
```

---

## 🚀 Quick Start Guide

### Prerequisites

- **Python**: `3.11+`
- **PostgreSQL**: `14+`
- **Node.js** (Optional, for serving frontend statically via `npx serve`)

---

### 1. Frontend Setup

The frontend is a lightweight, zero-dependency static Single-Page Application (SPA).

#### Option A: Direct Browser Execution
Simply open `frontend/index.html` in any modern web browser.

#### Option B: Local HTTP Server (Recommended)
```bash
# Using Python
python -m http.server 5500 --directory frontend

# Using Node.js
npx serve frontend -p 5500
```
Open `http://localhost:5500` (or `http://localhost:3001`) in your browser.

---

### 2. Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate

# 3. Install required dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env       # On macOS / Linux
copy .env.example .env     # On Windows

# 5. Start the FastAPI development server
uvicorn main:app --reload --port 8001
```

- **Interactive API Documentation (Swagger UI)**: `http://localhost:8001/docs`
- **Alternative API Docs (ReDoc)**: `http://localhost:8001/redoc`
- **Health Check**: `http://localhost:8001/health`

---

### 3. Database Setup

```bash
# 1. Create PostgreSQL Database
createdb krishikarya

# Or via psql interactive console:
# CREATE DATABASE krishikarya;

# 2. Run Database Schema
psql -d krishikarya -f database/schema.sql

# 3. Seed Sample Data (14 Verified Farmers + Produce Listings)
psql -d krishikarya -f database/seed.sql
```

> 💡 **Tip:** Refer to [`database/README.md`](file:///c:/Users/BIT/Downloads/krishi-karya-website_claude/database/README.md) for details on setting up Alembic migrations.

---

### 4. AI Model Service Integration

Quality grading and demand forecasting rely on the trained machine learning inference microservice running on port `8002`.

```bash
# Start the AI Model Service (from model repository directory)
uvicorn app.main:app --reload --port 8002
```

The website backend proxies requests to this service via the following endpoints:
- `POST /api/v1/ai/quality-grading` — Multipart crop image assessment
- `POST /api/v1/ai/demand-forecast` — Crop demand & price trend calculation
- `GET /api/v1/ai/models-health` — AI service availability check

---

## ⚙️ Environment Variables

Configure the following parameters in `backend/.env`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:password@localhost:5432/krishikarya` | Database connection string |
| `SECRET_KEY` | `change-this-in-production` | Secret key for JWT signature verification |
| `ALGORITHM` | `HS256` | Cryptographic algorithm for JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT token lifespan in minutes |
| `CORS_ORIGINS` | `http://localhost:3001,http://127.0.0.1:3001,http://localhost:5500` | Allowed CORS origins (comma-separated) |
| `AI_MODEL_SERVICE_URL` | `http://127.0.0.1:8002` | Endpoint URL for the external AI inference service |
| `AI_MODEL_SERVICE_TIMEOUT` | `90.0` | HTTP request timeout for AI service calls (seconds) |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP host for email notifications |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `""` | SMTP authentication username |
| `SMTP_PASSWORD` | `""` | SMTP authentication password / App Key |

---

## 🔌 API Reference

### Health & System
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server status and version check | Public |

### Authentication & Users
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new farmer or buyer account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user and receive JWT access token | Public |
| `GET` | `/api/v1/auth/me` | Fetch currently authenticated user profile | Authenticated |

### Produce Marketplace
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/produce` | Search and filter produce listings | Public |
| `GET` | `/api/v1/produce/{id}` | Retrieve specific produce listing details | Public |
| `POST` | `/api/v1/produce` | Create a new produce listing | Farmer / Admin |
| `PUT` | `/api/v1/produce/{id}` | Update existing produce listing | Owner / Admin |
| `DELETE` | `/api/v1/produce/{id}` | Soft-delete produce listing | Owner / Admin |

### Farmers & Matching
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/farmers` | List verified farmer profiles | Public |
| `GET` | `/api/v1/farmers/{id}` | Get detailed farmer profile | Public |
| `POST` | `/api/v1/farmers` | Register new farmer profile | Authenticated |

### Orders & Procurement
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/orders` | Retrieve list of user orders | Authenticated |
| `POST` | `/api/v1/orders` | Submit a new procurement order | Buyer |
| `GET` | `/api/v1/orders/{id}` | Retrieve order details by ID | Authenticated |
| `PUT` | `/api/v1/orders/{id}/status` | Update order status (Pending, Shipped, Delivered) | Seller / Admin |

### AI Services
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/ai/analyze` | Fast crop disease & ripeness evaluation | Public |
| `POST` | `/api/v1/ai/quality-grading` | Deep AI crop quality grading via microservice | Public |
| `POST` | `/api/v1/ai/demand-forecast` | Regional demand & price trend forecast | Public |
| `GET` | `/api/v1/ai/models-health` | Verify external AI inference model availability | Public |

### Communication & Administration
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/contact` | Submit contact / feedback form | Public |
| `GET` | `/api/v1/admin/stats` | Retrieve platform-wide procurement metrics | Admin |
| `GET` | `/api/v1/notifications` | Fetch unread notifications for logged-in user | Authenticated |

---

## 🛠️ Tech Stack

- **Frontend**: Standard HTML5, Modular CSS3 (Custom Variables, Flexbox/Grid), Vanilla JavaScript (ES6+ ES Modules), Feather SVG Icon Set.
- **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+), ASGI Server via [Uvicorn](https://www.uvicorn.org/).
- **Database & ORM**: PostgreSQL 14+, [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Async Engine), [Asyncpg](https://github.com/MagicStack/asyncpg), [Alembic](https://alembic.sqlalchemy.org/).
- **Security & Validation**: Pydantic v2, PyJWT / Python-Jose (JWT), Passlib (Bcrypt hashing).
- **AI & Data Processing**: Python Pillow (Image Processing), HTTPX (Async HTTP Client).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

