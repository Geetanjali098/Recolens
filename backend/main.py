"""
main.py
-------
FastAPI backend for the Hybrid Product Recommendation System.

Endpoints:
  GET /                  → health check
  GET /products          → list all products (optional ?category= filter)
  GET /recommend         → hybrid recommendations for user + product
  GET /trending          → top trending products
  GET /categories        → all product categories

Run locally:
  uvicorn main:app --reload --port 8000
"""

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from recommendation import HybridRecommender

# ---------------------------------------------------------------------- #
#  App Setup                                                               #
# ---------------------------------------------------------------------- #

app = FastAPI(
    title="Hybrid Recommendation API",
    description="Content-Based + Collaborative Filtering recommendation engine",
    version="1.0.0",
)

# Allow requests from any origin (needed for React frontend on Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # In production, replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------- #
#  Load Recommender on Startup                                             #
# ---------------------------------------------------------------------- #

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

recommender = HybridRecommender(
    products_path=str(DATA_DIR / "products.csv"),
    ratings_path=str(DATA_DIR / "ratings.csv"),
)

# ---------------------------------------------------------------------- #
#  Routes                                                                  #
# ---------------------------------------------------------------------- #


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Hybrid Recommendation API is running 🚀",
        "docs": "/docs",
    }


@app.get("/products")
def get_products(category: str = Query(default=None, description="Filter by category")):
    """
    Return all products, optionally filtered by category.

    Query params:
      category (str, optional): e.g. Electronics, Footwear, Books
    """
    products = recommender.products_df.to_dict(orient="records")

    if category:
        products = [p for p in products if p["category"].lower() == category.lower()]

    return {"products": products, "total": len(products)}


@app.get("/recommend")
def get_recommendations(
    user_id: int = Query(..., description="Target user ID (1–20)"),
    product_id: int = Query(..., description="Reference product ID (1–30)"),
    top_n: int = Query(default=5, ge=1, le=20, description="Number of results"),
):
    """
    Return hybrid recommendations for a given user and product.

    Returns three lists:
      - content_recommendations:       products similar to the reference product
      - collaborative_recommendations: products liked by similar users
      - hybrid_recommendations:        combined & re-ranked list
    """
    try:
        result = recommender.get_hybrid_recommendations(
            user_id=user_id,
            product_id=product_id,
            top_n=top_n,
        )
        return {
            "user_id": user_id,
            "product_id": product_id,
            **result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@app.get("/trending")
def get_trending(top_n: int = Query(default=6, ge=1, le=30)):
    """Return the top trending products based on rating volume × average rating."""
    try:
        trending = recommender.get_trending_products(top_n=top_n)
        return {"trending": trending, "total": len(trending)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trending error: {str(e)}")


@app.get("/categories")
def get_categories():
    """Return all unique product categories."""
    categories = recommender.get_categories()
    return {"categories": categories}
