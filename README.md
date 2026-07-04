# 🔭 RecoLens — Hybrid Product Recommendation System

<div align="center">

![RecoLens Banner](https://img.shields.io/badge/RecoLens-Hybrid%20Recommendation%20System-F4A535?style=for-the-badge&logo=react)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5.0-F7931E?style=flat-square&logo=scikit-learn)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**🌐 [Live Demo](https://recolens-phi.vercel.app)  ·  ⚙️ [API Backend](https://geetanjali09-recolens-api.hf.space)  ·  📦 [GitHub](https://github.com/Geetanjali098/Recolens)**

</div>

---

## 📌 Table of Contents

- [What is RecoLens?](#1-what-is-recolens)
- [The Problem It Solves](#2-the-problem-it-solves)
- [How It Actually Works](#3-how-it-actually-works)
- [Tech Stack](#4-tech-stack)
- [Project Structure](#5-project-structure)
- [API Endpoints](#6-api-endpoints)
- [Features](#7-features)
- [Deployment — HuggingFace + Vercel](#8-deployment--HuggingFace--vercel)
- [Local Development Setup](#9-local-development-setup)
- [Dataset](#10-dataset)

---

## 1. What is RecoLens?

**RecoLens** is a full-stack **Hybrid Product Recommendation System** — a web application that suggests relevant products to users by combining two different AI/ML techniques into one unified recommendation engine.

Instead of relying on just one method (like most simple demos), RecoLens blends **Content-Based Filtering** and **Collaborative Filtering** — the same core approach used by **Amazon, Netflix, and Spotify**.

---

## 2. The Problem It Solves

| ❌ The Problem | ✅ RecoLens Solution |
|---|---|
| Users are overwhelmed by huge product catalogues and cannot find relevant items without spending too much time searching. | Smart recommendations surface the right products instantly — no browsing needed. |
| Single-method recommenders are inaccurate — content-only ignores behaviour; collaborative-only fails for new products. | Hybrid fusion (40% content + 60% collaborative) gives the best of both worlds for high accuracy. |
| Cold-start problem: new users with no history get zero recommendations. | Automatic fallback to globally popular products ensures every user gets results. |
| Developers struggle to understand how recommendation engines work in a real-world context. | Fully documented, beginner-friendly codebase with clean separation of ML logic and API. |

---

## 3. How It Actually Works

### 3.1 Content-Based Filtering

> *"Find products SIMILAR to this product"*

- Product features used: **category** (label-encoded) + **price** (min-max normalized to 0–1)
- A **30×30 cosine similarity matrix** is computed across all products
- Products with the closest vector angle = most similar
- **Example:** viewing iPhone → recommends Samsung, iPad, MacBook (same category + price range)

### 3.2 Collaborative Filtering

> *"People like you also liked..."*

- Builds a **User–Product rating pivot table** (20 users × 30 products)
- Computes **user-to-user cosine similarity** — finds your 5 most similar users
- Recommends highly-rated products from those users that you have not yet seen
- **Cold-start fallback:** unknown users get globally top-rated products automatically

### 3.3 Hybrid Fusion

Both scores are normalised to [0, 1] then blended:

```
Hybrid Score = ( 0.4 × Content Score ) + ( 0.6 × Collaborative Score )
```

Collaborative gets **60% weight** because it reflects actual personal taste.
Content gets **40% weight** for feature similarity.
The union of both candidate sets is scored and re-ranked into a single final list.

### 3.4 System Architecture

```
  Browser / React Frontend
         │
         │  HTTP (Axios)
         ▼
  FastAPI Backend  (/recommend endpoint)
         │
         ▼
  HybridRecommender (recommendation.py)
         │
   ┌─────┴──────┐
   ▼            ▼
Content      Collaborative
Filtering    Filtering
(cosine      (user-item matrix
 similarity   + user similarity)
 on features)
   │            │
   └─────┬──────┘
         ▼
   Hybrid Fusion (weighted blend)
         │
         ▼
   JSON Response → React UI
```

---

## 4. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | FastAPI + Uvicorn | High-performance async Python API framework with auto-generated Swagger docs |
| **ML Engine** | scikit-learn, pandas, numpy | Cosine similarity, label encoding, min-max scaling, pivot tables |
| **Frontend** | React 18 + Vite | Modern component-based UI with fast HMR dev experience |
| **Styling** | Tailwind CSS | Utility-first CSS with custom design tokens, animations, skeleton loaders |
| **HTTP Client** | Axios | Promise-based HTTP calls with timeout, error handling and base URL config |
| **Routing** | React Router v6 | Client-side SPA routing between Home and Recommend pages |
| **Backend Host** | Hugging Face | Free Python hosting — never sleeps, no credit card, auto-deploy from GitHub |
| **Frontend Host** | Vercel | Zero-config React/Vite deployment with global CDN and instant HTTPS |

---

## 5. Project Structure

```
Recolens/
├── backend/
│   ├── main.py              # FastAPI app — 5 REST endpoints
│   ├── recommendation.py    # HybridRecommender class (ML engine)
│   ├── requirements.txt     # Python dependencies
│   └── data/
│       ├── products.csv     # 30 products across 6 categories
│       └── ratings.csv      # 110+ user-product ratings (20 users)
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Root component + routing
    │   ├── pages/
    │   │   ├── Home.jsx         # Browse + trending + category filter
    │   │   └── Recommend.jsx    # Recommendation UI + 3-tab results
    │   ├── components/
    │   │   ├── ProductCard.jsx  # Product display card
    │   │   ├── SkeletonCard.jsx # Loading placeholder
    │   │   ├── ErrorBanner.jsx  # Error handling UI
    │   │   ├── LoadingSpinner.jsx
    │   │   └── Navbar.jsx
    │   └── utils/
    │       └── api.js           # All Axios API calls
    ├── package.json
    └── tailwind.config.js
```

---

## 6. API Endpoints

| Method | Endpoint | Parameters | Returns |
|---|---|---|---|
| `GET` | `/` | None | Health check status |
| `GET` | `/products` | `?category=` *(optional)* | All 30 products, filterable by category |
| `GET` | `/recommend` | `user_id`, `product_id`, `top_n` | 3 recommendation lists (hybrid, content, collab) |
| `GET` | `/trending` | `?top_n=6` *(optional)* | Top trending products by rating volume × avg score |
| `GET` | `/categories` | None | All unique product categories |

### Example `/recommend` Response

```json
{
  "user_id": 3,
  "product_id": 6,
  "content_recommendations": [...],
  "collaborative_recommendations": [...],
  "hybrid_recommendations": [...]
}
```

> 📖 Interactive API docs available at: `/docs`

---

## 7. Features

### 🎨 Frontend Features
- ✅ Home page with **Trending Products** section
- ✅ **Category filter pills** (Electronics, Footwear, Books, Clothing, Kitchen, Sports)
- ✅ Recommendation page with **User ID input** + product dropdown
- ✅ **3-tab results:** Hybrid | Similar Products | Users Also Liked
- ✅ **Match % score badge** on every recommendation card
- ✅ **Skeleton loading cards** with shimmer animation
- ✅ **Error banners** with dismiss button
- ✅ Animated product cards with hover lift effect
- ✅ Fully responsive grid layout

### ⚙️ Backend Features
- ✅ **Hybrid recommendation engine** (content + collaborative)
- ✅ **Cosine similarity matrix** for content-based filtering
- ✅ **User-item matrix** + user similarity for collaborative filtering
- ✅ **Weighted hybrid score fusion** (40/60 split)
- ✅ **Cold-start fallback** for unknown users
- ✅ **Trending score:** rating volume × average rating
- ✅ **CORS middleware** for cross-origin frontend access
- ✅ **Auto-generated Swagger/OpenAPI** documentation at `/docs`
- ✅ Input validation with FastAPI Query parameters

---

## 8. Deployment — Leapcell + Vercel

### 8.1 Why This Combination?

| Feature | HuggingFace *(Backend)* | Vercel *(Frontend)* |
|---|---|---|
| Cost | Free forever ✅ | Free forever ✅ |
| Credit Card | Not required ✅ | Not required ✅ |
| Sleeps on idle | Never sleeps ✅ | Never sleeps ✅ |
| Auto Deploy | On every GitHub push ✅ | On every GitHub push ✅ |
| Python / FastAPI | Fully supported ✅ | N/A — Frontend only |
| HTTPS / SSL | Included ✅ | Included ✅ |

### 8.2 Backend Deployment on HuggingFace
 
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Fill in the details:
 
   Owner:      your-username
   Space name: recolens-api
   License:    MIT
   SDK:        Docker        ← SELECT THIS (not Gradio/Streamlit)
   Hardware:   CPU Basic     ← Free tier ✅
 
4. Click "Create Space"
```


### 8.3 Frontend Deployment on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **New Project** → Import Recolens repo
3. Set **Framework Preset:** `Vite`
4. Set **Root Directory:** `frontend`
5. Add **Environment Variable:** `VITE_API_URL = (your Leapcell URL)`
6. Click **Deploy** → live at `.vercel.app`

### 8.4 Auto-Deploy Update Flow

```
  You push code → git push origin main
          │
    ┌─────┴─────┐
    ▼           ▼
 HuggingFace     Vercel
 detects      detects
 change       change
    │           │
    ▼           ▼
 Backend      Frontend
 rebuilds     rebuilds
 (~3 min)     (~1 min)
    │           │
    ▼           ▼
 Live ✅       Live ✅

  Zero downtime. No manual steps.
```

### 8.5 Environment Variables

| Platform | Key | Value |
|---|---|---|
| **HuggingFace** (backend) | `PORT` | `7860` |
| **Vercel** (frontend) | `VITE_API_URL` | `https://geetanjali09-recolens-api.hf.space` |

---

## 9. Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# API:  http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend

```bash
cd frontend

# Create .env file with:
# VITE_API_URL=http://localhost:8000

npm install
npm run dev

# App: http://localhost:5173
```

> ⚠️ **Important:** Create a `frontend/.env` file with `VITE_API_URL=http://localhost:8000` before running `npm run dev`

---

## 10. Dataset

| File | Size | Contents |
|---|---|---|
| `products.csv` | 30 products | 6 categories: Electronics, Footwear, Books, Clothing, Kitchen, Sports |
| `ratings.csv` | 110+ ratings | 20 simulated users, ratings 1–5, realistic cross-category behaviour |

### products.csv columns
```
product_id, name, category, price, image_url
```

### ratings.csv columns
```
user_id, product_id, rating
```

---

## 🚀 Quick Start (TL;DR)

```bash
# Clone the repo
git clone https://github.com/Geetanjali098/Recolens.git
cd Recolens

# Start backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Start frontend (new terminal)
cd frontend
echo "VITE_API_URL=http://localhost:8000" > .env
npm install && npm run dev

# Open http://localhost:5173 ✅
```

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Built with ❤️ by **Geetanjali Nishad**

[![GitHub](https://img.shields.io/badge/GitHub-Geetanjali098-181717?style=flat-square&logo=github)](https://github.com/Geetanjali098/Recolens)

</div>
