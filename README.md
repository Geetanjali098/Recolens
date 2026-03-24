# 🔭 RecoLens — Hybrid Product Recommendation System

A full-stack recommendation engine that combines **Content-Based Filtering** and **Collaborative Filtering** into a single Hybrid system — built with **FastAPI** (Python) and **React + Tailwind CSS**.

---

## 📐 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     React Frontend                        │
│   Home Page (Browse + Trending) │ Recommend Page         │
│   Axios → VITE_API_URL env var                           │
└─────────────────────┬────────────────────────────────────┘
                      │ HTTP
┌─────────────────────▼────────────────────────────────────┐
│                   FastAPI Backend                         │
│  GET /products   GET /recommend   GET /trending           │
│  GET /categories                                          │
└─────────────────────┬────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────┐
│            HybridRecommender (recommendation.py)          │
│                                                           │
│  ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │  Content-Based      │   │  Collaborative           │  │
│  │  (cosine similarity │   │  (user–item matrix +     │  │
│  │   on category+price)│   │   user cosine similarity)│  │
│  └────────┬────────────┘   └────────────┬────────────┘  │
│           │      40% weight │  60% weight│               │
│           └────────────────▼────────────┘               │
│                    Hybrid Fusion                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
hybrid-recommender/
├── backend/
│   ├── main.py              # FastAPI app & routes
│   ├── recommendation.py    # Hybrid recommendation engine
│   ├── requirements.txt
│   ├── .env.example
│   └── data/
│       ├── products.csv     # 30 products across 6 categories
│       └── ratings.csv      # 110 user–product ratings (20 users)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── utils/
        │   └── api.js           # Axios API helpers
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProductCard.jsx
        │   ├── SkeletonCard.jsx
        │   ├── LoadingSpinner.jsx
        │   ├── ErrorBanner.jsx
        │   └── SectionHeader.jsx
        └── pages/
            ├── Home.jsx         # Browse + trending
            └── Recommend.jsx    # Recommendation UI
```

---

## 🧠 How the Recommendation Engine Works

### 1. Content-Based Filtering
- **Features used:** product `category` (label-encoded) + `price` (min-max normalized)
- **Algorithm:** Cosine similarity matrix over all products
- **Output:** Top-N products most similar to the reference product

### 2. Collaborative Filtering
- **Builds:** User–product rating pivot table (rows = users, columns = products)
- **Algorithm:** User-to-user cosine similarity; finds top-5 similar users
- **Output:** Products rated highly by similar users that the target user hasn't seen

### 3. Hybrid Fusion
```
hybrid_score = 0.4 × (normalized content score)
             + 0.6 × (normalized collaborative score)
```
Both score maps are normalized to [0, 1] before blending. Products from either source are included as candidates.

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Run the server
uvicorn main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env file and set backend URL
cp .env.example .env
# Edit .env → VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## ☁️ Deployment

### Backend → Render

1. Push your `backend/` folder to a GitHub repository.
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Configure:
   | Setting | Value |
   |---|---|
   | **Environment** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | Free |
5. Click **Deploy** → copy your `.onrender.com` URL

### Frontend → Vercel

1. Push your `frontend/` folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repo
4. Configure:
   | Setting | Value |
   |---|---|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` |
   | **Environment Variable** | `VITE_API_URL` = your Render URL |
5. Click **Deploy**

> ⚠️ After getting your Vercel URL, update the `ALLOWED_ORIGINS` in your backend's `main.py` for production CORS security.

---

## 🔌 API Reference

| Method | Endpoint | Params | Description |
|---|---|---|---|
| GET | `/` | — | Health check |
| GET | `/products` | `?category=` | All products (optional filter) |
| GET | `/recommend` | `user_id`, `product_id`, `top_n` | Hybrid recommendations |
| GET | `/trending` | `?top_n=6` | Trending products |
| GET | `/categories` | — | All categories |

### Example `/recommend` response
```json
{
  "user_id": 3,
  "product_id": 6,
  "content_recommendations": [...],
  "collaborative_recommendations": [...],
  "hybrid_recommendations": [...]
}
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Uvicorn |
| ML | scikit-learn, pandas, numpy |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| HTTP | Axios |
| Routing | React Router v6 |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

---

## 🧪 Sample Data

- **30 products** across 6 categories: Electronics, Footwear, Books, Clothing, Kitchen, Sports
- **20 users** with **110+ ratings** (scale 1–5)
- Cold-start users (IDs not in ratings.csv) fall back to globally popular products

---

## ⭐ Features

- [x] Hybrid recommendation (content + collaborative)
- [x] Category filter on home page
- [x] Trending products section
- [x] Loading skeletons
- [x] Error banners with dismiss
- [x] Full loading spinner
- [x] Responsive grid layout
- [x] Animated product cards
- [x] Match score badges on recommendation cards
- [x] Tab switcher (Hybrid / Similar / Users Also Liked)
- [x] Cold-start fallback (popular products for unknown users)
