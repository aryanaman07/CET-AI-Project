"""
IITP CET AI — Multi-Provider LLM Integration & Fallback Service
--------------------------------------------------------------
This service provides robust, grounded text generation with automatic failover:
  1. Primary Provider: Google Gemini (gemini-3.5-flash-lite)
     - Fast, cost-efficient, 1M context window for academic document analysis.
  2. Secondary Provider: OpenRouter (openai/gpt-4o-mini)
     - Automatically activated if Gemini returns an error or exceeds timeout.
  3. Deterministic Grounded Fallback:
     - If both cloud APIs fail or are unconfigured, synthesizes an answer directly
       from retrieved document text and verified citations. Never crashes.
  4. Async Non-blocking Execution:
     - Uses Python's asyncio event loop with loop.run_in_executor() so long-running
       LLM network calls never freeze the FastAPI server.
"""

import asyncio
import logging
import os
import requests
from typing import List, Dict, Any, Tuple, Optional
from ..config import settings
from ..models.schemas import Citation

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the CET AI Academic Assistant for IIT Patna Centre for Educational Technology (CET).

CRITICAL OPERATIONAL GUARDRAILS:
1. STRICT SOURCE GROUNDING: Answer using ONLY the verified source passages provided below.
2. NO INVENTING OR HALLUCINATION: Avoid inventing or guessing admissions cutoffs, deadlines, fees, or policies.
3. ADMIT UNKNOWN: If the provided sources do not contain the answer, you MUST state clearly that the verified public sources do not contain this information.
4. VERIFIED VS UNCERTAINTY: Clearly distinguish verified facts from uncertainty or general recommendations.
5. CLICKABLE CITATIONS: Provide clickable markdown source links in your answer: [Document Title](source_url).
6. INDEPENDENT PROTOTYPE: Always uphold that this chatbot is an independent student academic companion prototype and is NOT officially endorsed by IIT Patna.
7. CREDENTIAL SAFETY: Never ask for, accept, or process student passwords, login credentials, or private Moodle submissions.
8. FORMATTING: Structure your answer cleanly with Markdown headings (###), bold key terms, and bullet points for readability.
"""

class LLMService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._gemini_client = None
        self._init_gemini()

    def _init_gemini(self):
        """Initializes Google Gemini if API key is configured in environment."""
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._gemini_client = genai.GenerativeModel(self.model_name)
                logger.info(f"Google Gemini generative AI client initialized with model '{self.model_name}'.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")
                self._gemini_client = None
        else:
            logger.info("No GEMINI_API_KEY provided. Operating in dual-provider / grounded mode.")

    def _format_context(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """Formats retrieved chunks into numbered context blocks for prompt injection."""
        context_parts = []
        for i, chunk in enumerate(retrieved_chunks, 1):
            source_url = chunk.get("source_url", "")
            title = chunk.get("page_title", "")
            page = chunk.get("page_number", 1)
            text = chunk.get("text", "")
            section = chunk.get("section", "")
            context_parts.append(
                f"[SOURCE {i}] (Title: {title}, Section: {section}, Page: {page}, URL: {source_url})\n{text}"
            )
        return "\n\n".join(context_parts)

    def _call_gemini(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Synchronous Gemini generation call executed in thread pool."""
        if not self._gemini_client:
            raise ValueError("Gemini client not initialized")
        full_p = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        response = self._gemini_client.generate_content(full_p)
        if response and response.text:
            return response.text
        raise RuntimeError("Empty response received from Gemini API")

    def _call_openrouter(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Synchronous OpenRouter generation call executed in thread pool."""
        if not settings.OPENROUTER_API_KEY:
            raise ValueError("OpenRouter API key not configured")
        
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://cet.iitp.ac.in",
            "X-Title": "CET AI Academic Assistant"
        }
        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt or SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 2048
        }
        res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=settings.LLM_TIMEOUT_SECONDS
        )
        if res.status_code == 200:
            data = res.json()
            return data["choices"][0]["message"]["content"]
        else:
            raise RuntimeError(f"OpenRouter returned HTTP {res.status_code}: {res.text[:200]}")

    async def generate_completion(self, prompt: str, system_prompt: Optional[str] = None) -> Tuple[str, str]:
        """
        Attempts Primary (Gemini) -> Secondary (OpenRouter) -> raises RuntimeError if both unavailable.
        Returns (raw_text, engine_name).
        """
        loop = asyncio.get_running_loop()
        
        if self._gemini_client:
            try:
                ans_text = await asyncio.wait_for(
                    loop.run_in_executor(None, self._call_gemini, prompt, system_prompt),
                    timeout=settings.LLM_TIMEOUT_SECONDS
                )
                if ans_text and ans_text.strip():
                    engine = self.model_name if self.model_name.startswith("gemini") else f"gemini-{self.model_name}"
                    return ans_text.strip(), engine
            except Exception as e:
                logger.warning(f"Primary provider (Gemini) failed: {e}. Trying secondary provider.")

        if settings.OPENROUTER_API_KEY:
            try:
                ans_text = await asyncio.wait_for(
                    loop.run_in_executor(None, self._call_openrouter, prompt, system_prompt),
                    timeout=settings.LLM_TIMEOUT_SECONDS
                )
                if ans_text and ans_text.strip():
                    return ans_text.strip(), f"openrouter-{settings.OPENROUTER_MODEL}"
            except Exception as e:
                logger.warning(f"Secondary provider (OpenRouter) failed: {e}.")

        raise RuntimeError("No LLM provider available or responding.")

    def _build_grounded_fallback_response(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        has_sufficient_context: bool,
        api_notice: str = ""
    ) -> str:
        """
        Deterministic, hallucination-free response generation.
        Used when LLM APIs are unavailable or when context is insufficient.
        """
        disclaimer_footer = (
            f"\n\n---\n*Disclaimer: CET AI is an independent academic companion prototype and is not officially endorsed by IIT Patna. "
            f"For official circulars and notices, please consult [{settings.INSTITUTE_NAME}]({settings.OFFICIAL_PORTAL}).*"
        )

        if not has_sufficient_context or not retrieved_chunks:
            return (
                f"Based on the verified public records currently available from the **IIT Patna Centre for Educational Technology (CET)**, "
                f"there is **no supporting information** to answer your question regarding:\n\n"
                f"> \"{query}\"\n\n"
                f"### What you can do:\n"
                f"• Check the official CET website: [{settings.OFFICIAL_PORTAL}]({settings.OFFICIAL_PORTAL})\n"
                f"• For formal administrative or academic questions, contact the CET Office at `cet_office@iitp.ac.in`\n"
                f"• For Moodle LMS access, visit [{settings.INSTITUTE_NAME} Moodle](https://moodle.iitp.ac.in/) directly"
                f"{disclaimer_footer}"
            )

        lines = []
        if api_notice:
            lines.append(f"> ℹ️ *{api_notice}*\n")

        lines.append("Based on verified public records from the **IIT Patna Centre for Educational Technology (CET)**:\n")

        # Group unique chunks by document section
        seen_sections = set()
        for chunk in retrieved_chunks:
            section = chunk.get("section", "").strip()
            text = chunk.get("text", "").strip()
            title = chunk.get("page_title", "CET Document")
            
            sec_key = f"{title}-{section}"
            if sec_key in seen_sections:
                continue
            seen_sections.add(sec_key)

            if section:
                lines.append(f"### {section}")
            lines.append(f"{text}\n")

        # Add clean source links section
        lines.append("### Verified Source References:")
        seen_urls = set()
        for chunk in retrieved_chunks:
            url = chunk.get("source_url", settings.OFFICIAL_PORTAL)
            title = chunk.get("page_title", "CET Portal")
            section = chunk.get("section", "")
            key = f"{title}-{url}"
            if key not in seen_urls:
                seen_urls.add(key)
                sec_suffix = f" (*{section}*)" if section else ""
                lines.append(f"• [{title}]({url}){sec_suffix}")

        lines.append(disclaimer_footer)
        return "\n".join(lines)

    async def generate_answer(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        has_sufficient_context: bool
    ) -> Tuple[str, List[Citation], str, str]:
        """
        Generates an answer using primary Google Gemini LLM, secondary OpenRouter LLM,
        or deterministic verified grounded fallback.
        Returns:
            Tuple of (response_text, citations_list, confidence, engine_name)
        """
        # Convert retrieved chunks to Citation models
        citations = []
        for c in retrieved_chunks:
            citations.append(Citation(
                doc_title=c["page_title"],
                source_url=c["source_url"],
                page=c.get("page_number", 1),
                retrieval_date=c["retrieval_date"],
                label=c.get("label", c["page_title"]),
                snippet=c.get("snippet")
            ))

        # Case 1: No supporting information found in verified knowledge base
        if not has_sufficient_context or not retrieved_chunks:
            response_text = self._build_grounded_fallback_response(
                query=query,
                retrieved_chunks=[],
                has_sufficient_context=False
            )
            return response_text, [], "none", "retriever-filter"

        # Prepare verified context prompt
        context_str = self._format_context(retrieved_chunks)
        full_prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"--- VERIFIED CONTEXT PASSAGES FROM IIT PATNA CET ---\n{context_str}\n\n"
            f"--- STUDENT QUESTION ---\n{query}\n\n"
            f"Please provide an accurate, helpful answer grounded strictly in the context above. "
            f"Structure clearly with Markdown headings (###), bold highlights, and bullet points. "
            f"Include clickable markdown links [Page Title](source_url) for any cited facts. "
            f"If the context does not answer a specific part, explicitly state that."
        )

        loop = asyncio.get_running_loop()

        # Case 2: Try Primary Provider (Google Gemini)
        if self._gemini_client:
            try:
                ans_text = await asyncio.wait_for(
                    loop.run_in_executor(None, self._call_gemini, full_prompt),
                    timeout=settings.LLM_TIMEOUT_SECONDS
                )
                if ans_text and ans_text.strip():
                    ans_text = ans_text.strip()
                    
                    # Ensure source reference links are included
                    if "http" not in ans_text:
                        source_links = ["\n\n### Verified Source References:"]
                        seen_urls = set()
                        for c in citations:
                            if c.source_url not in seen_urls:
                                seen_urls.add(c.source_url)
                                source_links.append(f"• [{c.doc_title}]({c.source_url})")
                        ans_text += "\n" + "\n".join(source_links)

                    if "officially endorsed" not in ans_text.lower():
                        ans_text += (
                            f"\n\n---\n*Disclaimer: CET AI is an independent academic prototype and is not officially endorsed by IIT Patna. "
                            f"Official portal: [{settings.OFFICIAL_PORTAL}]({settings.OFFICIAL_PORTAL}).*"
                        )
                    engine_name = self.model_name if self.model_name.startswith("gemini") else f"gemini-{self.model_name}"
                    return ans_text, citations, "high", engine_name
            except Exception as e:
                logger.warning(f"Primary provider (Gemini) encountered error/timeout: {e}. Attempting secondary provider.")

        # Case 3: Try Secondary Provider (OpenRouter)
        if settings.OPENROUTER_API_KEY:
            try:
                ans_text = await asyncio.wait_for(
                    loop.run_in_executor(None, self._call_openrouter, full_prompt),
                    timeout=settings.LLM_TIMEOUT_SECONDS
                )
                if ans_text and ans_text.strip():
                    ans_text = ans_text.strip()
                    
                    # Ensure source reference links are included
                    if "http" not in ans_text:
                        source_links = ["\n\n### Verified Source References:"]
                        seen_urls = set()
                        for c in citations:
                            if c.source_url not in seen_urls:
                                seen_urls.add(c.source_url)
                                source_links.append(f"• [{c.doc_title}]({c.source_url})")
                        ans_text += "\n" + "\n".join(source_links)

                    if "officially endorsed" not in ans_text.lower():
                        ans_text += (
                            f"\n\n---\n*Disclaimer: CET AI is an independent academic prototype and is not officially endorsed by IIT Patna. "
                            f"Official portal: [{settings.OFFICIAL_PORTAL}]({settings.OFFICIAL_PORTAL}).*"
                        )
                    return ans_text, citations, "high", f"openrouter-{settings.OPENROUTER_MODEL}"
            except Exception as e:
                logger.warning(f"Secondary provider (OpenRouter) encountered error/timeout: {e}. Falling back to verified grounded engine.")

        # Case 4: Final Deterministic Verified Grounded Engine Fallback
        had_remote_apis = bool(self._gemini_client or settings.OPENROUTER_API_KEY)
        engine_name = "verified-grounded-fallback" if had_remote_apis else "verified-grounded-engine"
        notice = "LLM synthesis service temporarily offline. Presenting verified excerpts directly from public records." if had_remote_apis else ""
        response_text = self._build_grounded_fallback_response(
            query=query,
            retrieved_chunks=retrieved_chunks,
            has_sufficient_context=True,
            api_notice=notice
        )
        confidence = "medium" if had_remote_apis else "high"
        return response_text, citations, confidence, engine_name

    def _format_notebook_context(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """Formats user document chunks inside defensive untrusted data boundaries."""
        context_parts = []
        for i, chunk in enumerate(retrieved_chunks, 1):
            doc_name = chunk.get("filename") or chunk.get("document_title") or "Document"
            page = chunk.get("page_number", 1)
            text = chunk.get("text", "")
            context_parts.append(
                f"[PASSAGE {i}] (Document: {doc_name}, Page: {page})\n{text}"
            )
        return "\n\n".join(context_parts)

    def _build_notebook_fallback_response(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        has_sufficient_context: bool,
        notebook_title: str = ""
    ) -> str:
        """Deterministic, grounded response constructed directly from retrieved excerpts."""
        if not has_sufficient_context or not retrieved_chunks:
            return (
                f"The uploaded study materials in this notebook do not contain information to answer your question regarding:\n\n"
                f"> \"{query}\"\n\n"
                f"**Suggestions:**\n"
                f"• Verify that the relevant lecture notes, textbook chapter, or handout PDF is uploaded to this notebook.\n"
                f"• Ensure the uploaded PDF contains selectable text (not an image-only scan without OCR)."
            )

        lines = [f"Based on your uploaded study materials in **{notebook_title or 'this notebook'}**:\n"]
        seen_passages = set()
        for chunk in retrieved_chunks:
            doc_name = chunk.get("filename") or chunk.get("document_title") or "Study Document"
            page = chunk.get("page_number", 1)
            text = chunk.get("text", "").strip()
            key = f"{doc_name}-p{page}"
            if key in seen_passages:
                continue
            seen_passages.add(key)
            lines.append(f"### From {doc_name} (Page {page}):\n{text}\n")

        lines.append("\n**Sources Cited:**")
        for chunk in retrieved_chunks:
            doc_name = chunk.get("filename") or chunk.get("document_title") or "Document"
            page = chunk.get("page_number", 1)
            lines.append(f"• [{doc_name}, Page {page}]")

        return "\n".join(lines)

    async def generate_notebook_answer(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        has_sufficient_context: bool,
        chat_history: Optional[List[Dict[str, str]]] = None,
        notebook_title: str = ""
    ) -> Tuple[str, List[Citation], str, str]:
        """
        Answers student questions grounded strictly in their uploaded notebook documents.
        Enforces prompt injection resistance and accurate source citations.
        """
        # Convert chunks to citations
        citations = []
        for c in retrieved_chunks:
            doc_name = c.get("filename") or c.get("document_title") or "Study Material"
            page_num = c.get("page_number", 1)
            citations.append(Citation(
                doc_title=doc_name,
                source_url=f"#page-{page_num}",
                page=page_num,
                retrieval_date="User Document",
                label=f"{doc_name}, Page {page_num}",
                snippet=c.get("snippet") or c.get("text", "")[:200]
            ))

        # Check sufficiency
        if not has_sufficient_context or not retrieved_chunks:
            fallback = self._build_notebook_fallback_response(
                query=query,
                retrieved_chunks=[],
                has_sufficient_context=False,
                notebook_title=notebook_title
            )
            return fallback, [], "none", "retriever-filter"

        # Format defensive untrusted context
        context_str = self._format_notebook_context(retrieved_chunks)
        
        # Format recent chat history if follow-up
        history_str = ""
        if chat_history:
            recent_turns = chat_history[-6:]
            formatted_turns = []
            for t in recent_turns:
                sender = "Student" if t.get("sender") == "user" else "Assistant"
                formatted_turns.append(f"{sender}: {t.get('text', '')}")
            if formatted_turns:
                history_str = "\n--- RECENT NOTEBOOK CONVERSATION HISTORY ---\n" + "\n".join(formatted_turns) + "\n"

        copilot_system_prompt = (
            f"You are an AI Academic Study Assistant analyzing the document '{notebook_title}'. "
            f"Answer questions using ONLY information found in the uploaded document passages provided. "
            f"Do NOT reference unrelated institutional policies, university portals, or unmentioned courses."
        )

        prompt = (
            f"You are an AI Study Assistant analyzing the uploaded document '{notebook_title}'.\n\n"
            f"<<<STUDENT_DOCUMENT_CONTEXT_START>>>\n"
            f"{context_str}\n"
            f"<<<STUDENT_DOCUMENT_CONTEXT_END>>>\n"
            f"{history_str}\n"
            f"--- STUDENT QUESTION ---\n"
            f"{query}\n\n"
            f"INSTRUCTIONS:\n"
            f"1. Answer using ONLY information found in the document context above.\n"
            f"2. Cite your sources in the text using format [DocumentName, Page X].\n"
            f"3. If the document passages do NOT contain the answer, say clearly: "
            f"'The uploaded document does not contain information to answer this question.'\n"
            f"4. Format with clean Markdown headings (###), bold terms, and bullet points."
        )

        loop = asyncio.get_running_loop()

        # Try Gemini
        if self._gemini_client:
            try:
                ans_text = await asyncio.wait_for(
                    loop.run_in_executor(None, self._call_gemini, prompt, copilot_system_prompt),
                    timeout=settings.LLM_TIMEOUT_SECONDS
                )
                if ans_text and ans_text.strip():
                    is_unsupported = any(p in ans_text.lower() for p in [
                        "do not contain information", "does not contain information",
                        "cannot find", "no information", "not found in the provided"
                    ])
                    return (
                        ans_text.strip(),
                        [] if is_unsupported else citations,
                        "none" if is_unsupported else "high",
                        self.model_name
                    )
            except Exception as e:
                logger.warning(f"Gemini generation error in notebook QA: {e}. Trying secondary provider.")

        # Try OpenRouter
        if settings.OPENROUTER_API_KEY:
            try:
                ans_text = await asyncio.wait_for(
                    loop.run_in_executor(None, self._call_openrouter, prompt, copilot_system_prompt),
                    timeout=settings.LLM_TIMEOUT_SECONDS
                )
                if ans_text and ans_text.strip():
                    is_unsupported = any(p in ans_text.lower() for p in [
                        "do not contain information", "does not contain information",
                        "cannot find", "no information", "not found in the provided"
                    ])
                    return (
                        ans_text.strip(),
                        [] if is_unsupported else citations,
                        "none" if is_unsupported else "high",
                        f"openrouter-{settings.OPENROUTER_MODEL}"
                    )
            except Exception as e:
                logger.warning(f"OpenRouter generation error in notebook QA: {e}. Using deterministic fallback.")

        # Deterministic grounded fallback
        fallback = self._build_notebook_fallback_response(
            query=query,
            retrieved_chunks=retrieved_chunks,
            has_sufficient_context=True,
            notebook_title=notebook_title
        )
        return fallback, citations, "medium", "grounded-document-engine"

llm_service = LLMService()

