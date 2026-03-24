"""
recommendation.py
-----------------
Hybrid Recommendation Engine combining:
1. Content-Based Filtering (product features: category + price)
2. Collaborative Filtering (user-product interaction matrix)

Author: Hybrid Recommender System
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity


class HybridRecommender:
    """
    A hybrid recommendation engine that combines content-based
    and collaborative filtering techniques.
    """

    def __init__(self, products_path: str, ratings_path: str):
        """
        Initialize the recommender by loading data and building models.

        Args:
            products_path: Path to products.csv
            ratings_path:  Path to ratings.csv
        """
        # --- Load Data ---
        self.products_df = pd.read_csv(products_path)
        self.ratings_df  = pd.read_csv(ratings_path)

        # Build both models on startup
        self._build_content_model()
        self._build_collaborative_model()

    # ------------------------------------------------------------------ #
    #  CONTENT-BASED FILTERING                                             #
    # ------------------------------------------------------------------ #

    def _build_content_model(self):
        """
        Encode product category and normalize price, then compute
        a cosine-similarity matrix over all products.
        """
        df = self.products_df.copy()

        # Encode category as a numeric label
        le = LabelEncoder()
        df["category_encoded"] = le.fit_transform(df["category"])

        # Normalize price to [0, 1]
        scaler = MinMaxScaler()
        df["price_normalized"] = scaler.fit_transform(df[["price"]])

        # Feature matrix: [category_encoded, price_normalized]
        feature_matrix = df[["category_encoded", "price_normalized"]].values

        # Cosine similarity between every pair of products
        self.content_sim_matrix = cosine_similarity(feature_matrix)

        # Map product_id → row index for quick look-up
        self.product_id_to_idx = {
            pid: idx for idx, pid in enumerate(df["product_id"])
        }

    def get_content_recommendations(self, product_id: int, top_n: int = 5) -> list[dict]:
        """
        Return the top_n most similar products to `product_id`
        based on content features (category + price).

        Args:
            product_id: The reference product.
            top_n:      How many recommendations to return.

        Returns:
            List of product dicts sorted by similarity (descending).
        """
        if product_id not in self.product_id_to_idx:
            return []

        idx = self.product_id_to_idx[product_id]

        # Similarity scores for this product vs all others
        sim_scores = list(enumerate(self.content_sim_matrix[idx]))

        # Sort by score descending, exclude the product itself
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = [s for s in sim_scores if s[0] != idx][:top_n]

        # Map back to product rows
        top_indices = [s[0] for s in sim_scores]
        result = self.products_df.iloc[top_indices].copy()
        result["score"] = [round(s[1], 4) for s in sim_scores]

        return result.to_dict(orient="records")

    # ------------------------------------------------------------------ #
    #  COLLABORATIVE FILTERING                                             #
    # ------------------------------------------------------------------ #

    def _build_collaborative_model(self):
        """
        Build a user–product rating matrix and compute
        user-to-user cosine similarity.
        """
        # Pivot table: rows = users, columns = products, values = ratings
        self.user_item_matrix = self.ratings_df.pivot_table(
            index="user_id",
            columns="product_id",
            values="rating",
            fill_value=0,   # unknown ratings → 0
        )

        # User similarity matrix
        self.user_sim_matrix = cosine_similarity(self.user_item_matrix)

        # Map user_id → row index
        self.user_id_to_idx = {
            uid: idx for idx, uid in enumerate(self.user_item_matrix.index)
        }

    def get_collaborative_recommendations(self, user_id: int, top_n: int = 5) -> list[dict]:
        """
        Find users similar to `user_id` and recommend products they
        liked that `user_id` hasn't rated yet.

        Args:
            user_id: The target user.
            top_n:   How many recommendations to return.

        Returns:
            List of product dicts sorted by predicted score (descending).
        """
        if user_id not in self.user_id_to_idx:
            # Cold-start: return top-rated products overall
            return self._get_popular_products(top_n)

        user_idx = self.user_id_to_idx[user_id]

        # Similarity of every other user to this user
        sim_scores = list(enumerate(self.user_sim_matrix[user_idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Pick top-5 similar users (excluding the user themselves)
        similar_users = [s for s in sim_scores if s[0] != user_idx][:5]

        # Products already rated by this user
        rated_products = set(
            self.ratings_df[self.ratings_df["user_id"] == user_id]["product_id"]
        )

        # Weighted score for each candidate product
        product_scores: dict[int, float] = {}
        for other_idx, similarity in similar_users:
            other_user_id = self.user_item_matrix.index[other_idx]

            # Ratings given by this similar user
            other_ratings = self.ratings_df[
                self.ratings_df["user_id"] == other_user_id
            ]

            for _, row in other_ratings.iterrows():
                pid = int(row["product_id"])
                if pid not in rated_products:
                    product_scores[pid] = (
                        product_scores.get(pid, 0) + row["rating"] * similarity
                    )

        if not product_scores:
            return self._get_popular_products(top_n)

        # Sort by weighted score and take top_n
        top_pids = sorted(product_scores, key=product_scores.get, reverse=True)[:top_n]

        result = self.products_df[self.products_df["product_id"].isin(top_pids)].copy()
        result["score"] = result["product_id"].map(
            lambda pid: round(product_scores.get(pid, 0), 4)
        )
        result = result.sort_values("score", ascending=False)

        return result.to_dict(orient="records")

    # ------------------------------------------------------------------ #
    #  HYBRID RECOMMENDATIONS                                              #
    # ------------------------------------------------------------------ #

    def get_hybrid_recommendations(
        self,
        user_id: int,
        product_id: int,
        top_n: int = 5,
        content_weight: float = 0.4,
        collab_weight: float = 0.6,
    ) -> dict:
        """
        Combine content-based and collaborative scores into a single
        ranked list of hybrid recommendations.

        Args:
            user_id:        Target user.
            product_id:     Reference product.
            top_n:          Final list size.
            content_weight: Weight given to content-based scores.
            collab_weight:  Weight given to collaborative scores.

        Returns:
            Dict with keys:
              - content_recommendations
              - collaborative_recommendations
              - hybrid_recommendations
        """
        content_recs = self.get_content_recommendations(product_id, top_n=top_n * 2)
        collab_recs  = self.get_collaborative_recommendations(user_id, top_n=top_n * 2)

        # Build score maps keyed by product_id
        content_map = {r["product_id"]: r["score"] for r in content_recs}
        collab_map  = {r["product_id"]: r["score"]  for r in collab_recs}

        # Union of all candidate product IDs
        all_pids = set(content_map) | set(collab_map)

        # Hybrid score = weighted sum (normalise each map to [0,1] first)
        def normalize(score_map: dict) -> dict:
            if not score_map:
                return {}
            max_v = max(score_map.values()) or 1
            return {k: v / max_v for k, v in score_map.items()}

        norm_content = normalize(content_map)
        norm_collab  = normalize(collab_map)

        hybrid_scores: dict[int, float] = {}
        for pid in all_pids:
            c_score = norm_content.get(pid, 0)
            u_score = norm_collab.get(pid, 0)
            hybrid_scores[pid] = (
                content_weight * c_score + collab_weight * u_score
            )

        top_pids = sorted(hybrid_scores, key=hybrid_scores.get, reverse=True)[:top_n]

        hybrid_recs = self.products_df[
            self.products_df["product_id"].isin(top_pids)
        ].copy()
        hybrid_recs["score"] = hybrid_recs["product_id"].map(
            lambda pid: round(hybrid_scores.get(pid, 0), 4)
        )
        hybrid_recs = hybrid_recs.sort_values("score", ascending=False)

        return {
            "content_recommendations":       content_recs[:top_n],
            "collaborative_recommendations": collab_recs[:top_n],
            "hybrid_recommendations":        hybrid_recs.to_dict(orient="records"),
        }

    # ------------------------------------------------------------------ #
    #  HELPERS                                                             #
    # ------------------------------------------------------------------ #

    def _get_popular_products(self, top_n: int = 5) -> list[dict]:
        """
        Fallback for cold-start: return globally top-rated products.
        """
        avg_ratings = (
            self.ratings_df.groupby("product_id")["rating"]
            .mean()
            .sort_values(ascending=False)
        )
        top_pids = avg_ratings.head(top_n).index.tolist()
        result = self.products_df[
            self.products_df["product_id"].isin(top_pids)
        ].copy()
        result["score"] = result["product_id"].map(
            lambda pid: round(avg_ratings.get(pid, 0), 4)
        )
        return result.to_dict(orient="records")

    def get_trending_products(self, top_n: int = 6) -> list[dict]:
        """
        Return the most-rated (popular) products as 'trending'.
        """
        rating_counts = (
            self.ratings_df.groupby("product_id")["rating"]
            .agg(["count", "mean"])
            .rename(columns={"count": "num_ratings", "mean": "avg_rating"})
        )
        # Trending score: volume × average rating
        rating_counts["trend_score"] = (
            rating_counts["num_ratings"] * rating_counts["avg_rating"]
        )
        top_pids = (
            rating_counts.sort_values("trend_score", ascending=False)
            .head(top_n)
            .index.tolist()
        )
        result = self.products_df[
            self.products_df["product_id"].isin(top_pids)
        ].copy()
        result["trend_score"] = result["product_id"].map(
            lambda pid: round(rating_counts.loc[pid, "trend_score"], 2)
            if pid in rating_counts.index else 0
        )
        return result.sort_values("trend_score", ascending=False).to_dict(
            orient="records"
        )

    def get_categories(self) -> list[str]:
        """Return all unique product categories."""
        return sorted(self.products_df["category"].unique().tolist())
