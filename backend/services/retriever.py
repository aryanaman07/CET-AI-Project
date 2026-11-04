"""
IITP CET AI — Institutional Knowledge Retrieval Service
-------------------------------------------------------
This service handles factual search across verified IIT Patna Centre for Educational
Technology (CET) documents, ordinances, fee structures, and course guidelines.

Distinct Role:
  - This retriever searches the static verified institutional knowledge base (cet_knowledge.json).
  - It is completely separate from vector_store.py, which searches student-uploaded notebook PDFs.

Scoring Methodology:
  1. Tokenizes user query and filters common English stop-words.
  2. Computes keyword coverage: fraction of distinct query terms found in each passage.
  3. Applies category and title boosts for exact program matches (e.g. BS-CSDA, BS-AICS).
  4. Enforces minimum confidence threshold (3.5) to reject off-topic questions without halluncination.
"""

import re
import math
from typing import List, Dict, Any, Tuple
from .knowledge_base import knowledge_base_service

# Standard comprehensive English stop words
STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
    "has", "hasn't", "have", "haven't", "having", "he", "her", "here", "hers", "herself", "him",
    "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "itself", "let's",
    "me", "more", "most", "much", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on",
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "per",
    "please", "same", "shan't", "she", "should", "shouldn't", "so", "some", "such", "than", "that",
    "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those",
    "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "were", "weren't",
    "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "won't", "would",
    "wouldn't", "you", "your", "yours", "yourself", "yourselves", "tell", "give"
}

class RetrieverService:
    def __init__(self, min_threshold: float = 3.5):
        self.min_threshold = min_threshold

    def _tokenize(self, text: str) -> List[str]:
        """Normalizes and tokenizes text into distinct alphanumeric tokens."""
        tokens = re.findall(r"[a-zA-Z0-9]+", text.lower())
        return [t for t in tokens if len(t) > 1 and t not in STOP_WORDS]

    def _extract_best_snippet(self, chunk_text: str, query_tokens: List[str]) -> str:
        """Finds the most informative sentence in the chunk matching query tokens."""
        sentences = re.split(r"(?<=[.!?])\s+", chunk_text)
        if not sentences:
            return chunk_text[:250]
        
        best_sentence = sentences[0]
        max_overlap = -1
        
        for s in sentences:
            s_tokens = set(self._tokenize(s))
            overlap = len(s_tokens.intersection(query_tokens))
            if overlap > max_overlap:
                max_overlap = overlap
                best_sentence = s
                
        return best_sentence.strip()

    def search(
        self,
        query: str,
        top_k: int = 4,
        document_id: str = None
    ) -> Tuple[List[Dict[str, Any]], bool]:
        """
        Retrieves top-K relevant chunks for the given query using token coverage and lexical scoring.
        Returns:
            Tuple: (ranked_chunks, has_sufficient_context)
        """
        all_chunks = knowledge_base_service.get_all_chunks()
        if not all_chunks:
            return [], False

        query_lower = query.lower()
        query_tokens = self._tokenize(query)

        if not query_tokens:
            return [], False

        query_token_set = set(query_tokens)
        num_query_tokens = len(query_token_set)

        scored_chunks = []

        for chunk in all_chunks:
            if document_id and chunk.get("doc_id") != document_id:
                continue

            text = chunk.get("text", "")
            title = chunk.get("page_title", "")
            section = chunk.get("section", "")
            category = chunk.get("category", "")
            
            combined_text = f"{title} {category} {section} {text}".lower()
            chunk_tokens = set(self._tokenize(combined_text))
            
            if not chunk_tokens:
                continue

            # Calculate exact token intersection
            matching_tokens = query_token_set.intersection(chunk_tokens)
            match_count = len(matching_tokens)
            
            if match_count == 0:
                continue

            coverage = match_count / num_query_tokens

            # Discard coincidental matches:
            # If query has 4 or more distinct keywords and only 1 matches (e.g. only 'semester' in laundry query),
            # this is purely coincidental.
            if num_query_tokens >= 4 and match_count < 2:
                continue

            # If query has 3 tokens and coverage is below 34%, discard
            if num_query_tokens >= 3 and coverage < 0.34:
                continue

            score = 0.0
            for qt in matching_tokens:
                count = combined_text.count(qt)
                # Term score with log saturation
                score += (1.0 + math.log(1.0 + count))
                # Boost if in title or section
                if qt in title.lower() or qt in section.lower():
                    score += 2.0

            # Coverage multiplier
            score *= (1.0 + 2.5 * coverage)

            # Exact phrase match bonus
            if len(query.strip()) > 5 and query_lower in combined_text:
                score += 10.0

            # Boost for key program/academic entity keywords
            special_keywords = ["aics", "csda", "moodle", "attendance", "eligibility", "calendar", "evaluation", "grading", "bba", "mtech", "plagiarism"]
            for sk in special_keywords:
                if sk in query_lower and sk in combined_text:
                    score += 3.0

            if score > 0:
                scored_chunks.append((score, chunk, coverage, match_count))

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        if not scored_chunks:
            return [], False

        highest_score = scored_chunks[0][0]
        top_coverage = scored_chunks[0][2]
        top_matches = scored_chunks[0][3]

        # Context is sufficient if:
        # Score meets threshold and either coverage >= 0.34 or at least 2 tokens matched
        has_sufficient_context = (highest_score >= self.min_threshold) and (top_coverage >= 0.34 or top_matches >= 2)

        top_results = []
        for score, chunk, _, _ in scored_chunks[:top_k]:
            snippet = self._extract_best_snippet(chunk["text"], query_tokens)
            doc_title = chunk["page_title"]
            page_num = chunk.get("page_number", 1)
            
            top_results.append({
                "chunk_id": chunk["chunk_id"],
                "doc_id": chunk["doc_id"],
                "section": chunk["section"],
                "page_number": page_num,
                "text": chunk["text"],
                "snippet": snippet,
                "source_url": chunk["source_url"],
                "page_title": doc_title,
                "retrieval_date": chunk["retrieval_date"],
                "label": f"{doc_title}, Page {page_num}" if page_num else doc_title,
                "score": round(score, 3)
            })

        return top_results, has_sufficient_context

retriever_service = RetrieverService()
