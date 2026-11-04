import json
import logging
from typing import List, Dict, Any, Optional
from ..config import settings

logger = logging.getLogger(__name__)

class KnowledgeBaseService:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.metadata: Dict[str, Any] = {}
        self.chunks: List[Dict[str, Any]] = []
        self.load()

    def load(self):
        """Loads verified documents and flattens chunks with full provenance metadata."""
        if not settings.KNOWLEDGE_BASE_FILE.exists():
            logger.warning(f"Knowledge base file not found at {settings.KNOWLEDGE_BASE_FILE}")
            self.documents = []
            self.chunks = []
            return

        try:
            with open(settings.KNOWLEDGE_BASE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            self.metadata = data.get("metadata", {})
            self.documents = data.get("documents", [])
            
            # Flatten chunks and ensure every chunk has parent provenance
            flattened_chunks = []
            for doc in self.documents:
                doc_id = doc.get("id")
                page_title = doc.get("page_title", "")
                source_url = doc.get("source_url", "")
                retrieval_date = doc.get("retrieval_date", "")
                category = doc.get("category", "")
                
                for chunk in doc.get("chunks", []):
                    flattened_chunks.append({
                        "chunk_id": chunk.get("chunk_id"),
                        "doc_id": doc_id,
                        "section": chunk.get("section", ""),
                        "page_number": chunk.get("page_number", 1),
                        "text": chunk.get("text", ""),
                        "source_url": chunk.get("source_url") or source_url,
                        "page_title": chunk.get("page_title") or page_title,
                        "retrieval_date": retrieval_date,
                        "category": category
                    })
            
            self.chunks = flattened_chunks
            logger.info(f"Loaded {len(self.documents)} verified documents and {len(self.chunks)} chunks.")
        except Exception as e:
            logger.error(f"Failed to load knowledge base: {e}")
            self.documents = []
            self.chunks = []

    def get_all_documents(self) -> List[Dict[str, Any]]:
        return self.documents

    def get_document_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        for doc in self.documents:
            if doc.get("id") == doc_id:
                return doc
        return None

    def get_all_chunks(self) -> List[Dict[str, Any]]:
        return self.chunks

knowledge_base_service = KnowledgeBaseService()
