"""
Vector store module using simple TF-IDF + cosine similarity.
Lightweight alternative to ChromaDB for Python 3.14 compatibility.
Uses the LLM API for embeddings when needed.
"""

import json
import os
import pickle
from pathlib import Path
from typing import Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class VectorStore:
    """Simple TF-IDF based vector store for document retrieval."""

    def __init__(
        self,
        persist_dir: str = "./data/vector_store",
    ):
        """
        Initialize vector store.

        Args:
            persist_dir: Directory to persist index data
        """
        self.persist_dir = Path(persist_dir)
        self.persist_dir.mkdir(parents=True, exist_ok=True)

        self.documents: list[dict] = []
        # Simple word tokenization for Vietnamese
        self.vectorizer = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.99,  # Higher threshold for small corpus
            token_pattern=r'(?u)\b\w+\b',  # Simple word pattern
            lowercase=True,
            strip_accents=None  # Preserve Vietnamese diacritics
        )
        self.tfidf_matrix = None

        # Try to load existing index
        self._load()

    def _save(self) -> None:
        """Persist index to disk."""
        data = {
            "documents": self.documents,
            "vectorizer": self.vectorizer,
            "tfidf_matrix": self.tfidf_matrix
        }
        with open(self.persist_dir / "index.pkl", "wb") as f:
            pickle.dump(data, f)

    def _load(self) -> bool:
        """Load index from disk."""
        index_file = self.persist_dir / "index.pkl"
        if index_file.exists():
            try:
                with open(index_file, "rb") as f:
                    data = pickle.load(f)
                self.documents = data["documents"]
                self.vectorizer = data["vectorizer"]
                self.tfidf_matrix = data["tfidf_matrix"]
                print(f"Loaded {len(self.documents)} documents from index")
                return True
            except Exception as e:
                print(f"Error loading index: {e}")
        return False

    def add_documents(
        self,
        documents: list[dict],
        id_prefix: str = "doc"
    ) -> int:
        """
        Add documents to the vector store.

        Args:
            documents: List of dicts with 'content' and optional 'metadata'
            id_prefix: Prefix for document IDs

        Returns:
            Number of documents added
        """
        if not documents:
            return 0

        added = 0
        for i, doc in enumerate(documents):
            content = doc.get("content", "")
            if not content or len(content) < 20:
                continue

            self.documents.append({
                "id": f"{id_prefix}_{len(self.documents)}",
                "content": content,
                "metadata": {k: str(v)[:500] for k, v in doc.items() if k != "content" and v}
            })
            added += 1

        if added > 0:
            # Rebuild TF-IDF matrix
            texts = [d["content"] for d in self.documents]
            self.tfidf_matrix = self.vectorizer.fit_transform(texts)
            self._save()

        print(f"Added {added} documents. Total: {len(self.documents)}")
        return added

    def search(
        self,
        query: str,
        n_results: int = 5,
        min_score: float = 0.1
    ) -> list[dict]:
        """
        Search for relevant documents.

        Args:
            query: Search query in natural language
            n_results: Maximum number of results
            min_score: Minimum similarity score (0-1)

        Returns:
            List of matching documents with scores
        """
        if not self.documents or self.tfidf_matrix is None:
            return []

        # Transform query using fitted vectorizer
        query_vec = self.vectorizer.transform([query])

        # Compute cosine similarity
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # Get top results
        top_indices = similarities.argsort()[::-1][:n_results]

        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score >= min_score:
                doc = self.documents[idx]
                results.append({
                    "content": doc["content"],
                    "metadata": doc["metadata"],
                    "score": round(score, 3)
                })

        return results

    def clear(self) -> None:
        """Clear all documents from the store."""
        self.documents = []
        self.tfidf_matrix = None
        self.vectorizer = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.99,
            token_pattern=r'(?u)\b\w+\b',
            lowercase=True,
            strip_accents=None
        )
        # Remove persisted file
        index_file = self.persist_dir / "index.pkl"
        if index_file.exists():
            index_file.unlink()
        print("Store cleared.")

    def count(self) -> int:
        """Return number of documents."""
        return len(self.documents)


def load_scraped_data(data_dir: str = "./data") -> list[dict]:
    """Load scraped data from JSON files and prepare for indexing."""
    data_path = Path(data_dir)
    documents = []

    # Load main site pages
    mainsite_file = data_path / "diensanh_pages.json"
    if mainsite_file.exists():
        print(f"Loading {mainsite_file}...")
        with open(mainsite_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            for page in data.get("pages", []):
                if page.get("content") and page.get("status") == "success":
                    documents.append({
                        "content": page["content"],
                        "title": page.get("title", ""),
                        "url": page.get("url", ""),
                        "source": "main_site",
                        "page_name": page.get("page_name", "")
                    })

    # Load public services procedures
    services_file = data_path / "dichvucong_procedures.json"
    if services_file.exists():
        print(f"Loading {services_file}...")
        with open(services_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            for proc in data.get("procedures", []):
                # Build content from procedure data
                content_parts = []

                if proc.get("title"):
                    content_parts.append(f"Thủ tục: {proc['title']}")

                # Add fields from main procedure record
                if proc.get("implementing"):
                    content_parts.append(f"Cơ quan thực hiện: {proc['implementing']}")
                if proc.get("field"):
                    content_parts.append(f"Lĩnh vực: {proc['field']}")
                if proc.get("code"):
                    content_parts.append(f"Mã thủ tục: {proc['code']}")

                # Add detail fields if available
                detail = proc.get("detail", {})

                # Use full_content from detail page if available
                if detail.get("full_content"):
                    content_parts.append(detail["full_content"])

                if content_parts:
                    documents.append({
                        "content": "\n".join(content_parts),
                        "title": proc.get("title", ""),
                        "url": proc.get("url", ""),
                        "source": "dichvucong",
                        "procedure_type": "public_service"
                    })

    print(f"Loaded {len(documents)} documents total")
    return documents


def build_index(data_dir: str = "./data", persist_dir: str = "./data/vector_store") -> VectorStore:
    """
    Build vector index from scraped data.

    Args:
        data_dir: Directory containing scraped JSON files
        persist_dir: Directory for index persistence

    Returns:
        Initialized VectorStore
    """
    # Load documents
    documents = load_scraped_data(data_dir)

    if not documents:
        print("No documents found. Run scrapers first.")
        return None

    # Initialize store and add documents
    store = VectorStore(persist_dir=persist_dir)
    store.clear()  # Start fresh
    store.add_documents(documents)

    return store


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "search":
        # Search mode
        query = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "thủ tục đăng ký khai sinh"
        store = VectorStore()
        results = store.search(query)
        print(f"\nSearch results for: {query}\n")
        for r in results:
            print(f"[{r['score']}] {r['metadata'].get('title', 'No title')[:60]}")
            print(f"    {r['content'][:200]}...")
            print()
    else:
        # Build index mode
        build_index()
