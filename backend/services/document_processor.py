"""
IITP CET AI — PDF Processing & Text Extraction Pipeline
-------------------------------------------------------
This module processes student-uploaded course PDFs using PyMuPDF (fitz):
  1. File Validation:
     - Verifies standard PDF magic bytes (%PDF-).
     - Enforces 50 MB maximum size limit and 500 page limit.
     - Detects encrypted or password-protected files.
  2. Academic Text Normalization (clean_academic_text):
     - Normalizes irregular unicode whitespace and smart quotes.
     - Repairs common font-mapping bullet glitches (Wingdings mapped to 'y', 'v', '§').
     - Re-stitches mid-sentence line breaks caused by fixed-width PDF columns.
  3. Overlapping Sliding-Window Chunking:
     - Chunks text into ~600 character segments (~120-150 words) with 120 character overlap.
     - Snaps chunk boundaries to sentence endings (. ) or paragraph newlines (\n\n).
     - Overlap prevents critical definitions from being sliced in half across boundaries.
  4. Scanned PDF Detection:
     - Flags PDFs with fewer than 50 total extracted characters as image-based/scanned,
       warning students that OCR is required for image scans.
"""

import io
import re
import os
import uuid
import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
import fitz  # PyMuPDF
from ..config import settings

logger = logging.getLogger(__name__)

class DocumentProcessingError(Exception):
    """Custom exception for validation and extraction errors."""
    def __init__(self, message: str, code: str = "PROCESSING_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code

class DocumentProcessor:
    """
    Handles PDF validation, PyMuPDF text extraction, page indexing,
    and overlapping chunk segmentation with strict notebook-level metadata preservation.
    """
    MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
    MAX_PAGE_COUNT = 500
    DEFAULT_CHUNK_SIZE = 600   # ~120-150 words
    DEFAULT_CHUNK_OVERLAP = 120 # ~25-30 words

    def sanitize_filename(self, filename: str) -> str:
        """Removes directory traversal markers and unsafe characters."""
        base = os.path.basename(filename).strip()
        # Remove any path separators or null bytes
        base = re.sub(r"[\\/:\*\?\"<>\|\x00]", "_", base)
        return base or "uploaded_document.pdf"

    def validate_pdf_bytes(self, file_bytes: bytes, filename: str) -> Tuple[bool, Optional[str]]:
        """
        Validates PDF format, file size, magic bytes, and basic readability.
        """
        # 1. File size check
        if len(file_bytes) == 0:
            return False, "Uploaded file is empty (0 bytes)."
        if len(file_bytes) > self.MAX_FILE_SIZE_BYTES:
            max_mb = self.MAX_FILE_SIZE_BYTES / (1024 * 1024)
            return False, f"File size exceeds the maximum allowed limit of {max_mb:.0f} MB."

        # 2. File extension check
        clean_name = self.sanitize_filename(filename)
        if not clean_name.lower().endswith(".pdf"):
            return False, "Invalid file format. Only PDF documents (.pdf) are supported."

        # 3. Magic bytes check (%PDF-)
        if not file_bytes.startswith(b"%PDF-"):
            return False, "Invalid PDF structure. The file header does not match the standard PDF specification."

        # 4. PyMuPDF stream readability test
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            if doc.is_encrypted:
                doc.close()
                return False, "The uploaded PDF is password-protected or encrypted. Please upload an unlocked PDF."
            
            page_count = len(doc)
            if page_count == 0:
                doc.close()
                return False, "The PDF contains no pages."
            if page_count > self.MAX_PAGE_COUNT:
                doc.close()
                return False, f"The PDF has {page_count} pages, which exceeds the maximum limit of {self.MAX_PAGE_COUNT} pages."
            
            doc.close()
        except Exception as e:
            logger.warning(f"PyMuPDF failed to open PDF stream for {filename}: {e}")
            return False, "Failed to read PDF document. The file may be corrupt or damaged."

        return True, None

    @staticmethod
    def clean_academic_text(raw_text: str) -> str:
        """
        Cleans extraction artifacts from academic PDFs:
        - Replaces non-standard whitespace (\u2002, \u2003, \u00a0)
        - Normalizes smart quotes and broken question marks ('70?s' -> "70's", '0 ? 9' -> '0 – 9')
        - Converts font bullet symbols ('y', 'v', '§', '·') to clean standard bullets ('• ')
        - Re-stitches broken mid-sentence line breaks while preserving paragraphs and headings
        """
        if not raw_text:
            return ""

        # 1. Normalize unicode spaces & punctuation
        text = raw_text.replace('\u2002', ' ').replace('\u2003', ' ').replace('\u00a0', ' ')
        text = text.replace('\u2018', "'").replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
        
        # Replace broken question mark apostrophes like 70?s -> 70's
        text = re.sub(r'(\b\d{2,4})\?s\b', r"\1's", text)
        text = re.sub(r'\b([a-zA-Z]+)\?([sStTdDmMrRvVeE])\b', r"\1'\2", text)
        text = re.sub(r'(\b\d+)\s*\?\s*(\d+\b)', r"\1 – \2", text)

        # 2. Fix PDF symbol font bullet glyphs (often extracted as 'y', 'v', '§', '·')
        text = re.sub(r'(?:^|\n)[ \t]*[yv§·\u2022\uf0b7\uf0a7][ \t]*\n[ \t]*', '\n• ', text)
        text = re.sub(r'(?:^|\n)[ \t]*[yv§·\u2022\uf0b7\uf0a7][ \t]+', '\n• ', text)
        text = re.sub(r'(\n•\s*)+', '\n• ', text)

        # 3. Clean line wrapping: stitch lines that were split mid-sentence
        lines = text.split('\n')
        joined_lines = []
        for line in lines:
            line_str = line.strip()
            if not line_str:
                joined_lines.append('')
                continue
            # If previous line did not end with punctuation or colon, and current line is not a heading or bullet, stitch
            if (joined_lines and joined_lines[-1] and 
                not joined_lines[-1].endswith(('.', ':', ';', '!', '?', '•', '-')) and 
                not line_str.startswith(('•', '-', '1.', '2.', '3.', 'Fig.', 'Chapter', '1)')) and
                not line_str.endswith(':') and
                len(joined_lines[-1]) < 85):
                joined_lines[-1] += ' ' + line_str
            else:
                joined_lines.append(line_str)

        cleaned = '\n'.join(joined_lines)
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        return cleaned.strip()

    def extract_document(
        self,
        file_bytes: bytes,
        filename: str,
        notebook_id: str,
        document_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extracts text page-by-page using PyMuPDF, detects scanned/empty documents,
        and constructs overlapping chunks preserving document names and page numbers.
        """
        is_valid, error_msg = self.validate_pdf_bytes(file_bytes, filename)
        if not is_valid:
            raise DocumentProcessingError(error_msg, code="VALIDATION_FAILED")

        clean_name = self.sanitize_filename(filename)
        doc_id = document_id or f"doc-{uuid.uuid4().hex[:12]}"
        doc_title = Path(clean_name).stem.replace("_", " ").replace("-", " ").strip()

        # Save PDF to backend uploads directory using a secure non-guessable path
        upload_subpath = f"{doc_id}_{clean_name}"
        stored_file_path = str(settings.UPLOADS_DIR / upload_subpath)
        try:
            with open(stored_file_path, "wb") as f:
                f.write(file_bytes)
        except Exception as e:
            logger.error(f"Failed to persist uploaded PDF to disk: {e}")
            # Fall back to in-memory path representation
            stored_file_path = upload_subpath

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
        except Exception as e:
            raise DocumentProcessingError(f"Unable to process PDF: {str(e)}", code="EXTRACT_ERROR")

        pages_data = []
        all_chunks = []
        total_chars = 0

        for page_idx in range(len(doc)):
            page_num = page_idx + 1
            page = doc[page_idx]
            
            # Extract plain text & clean academic artifacts
            raw_text = page.get_text("text") or ""
            clean_page_text = self.clean_academic_text(raw_text)
            total_chars += len(clean_page_text)

            page_title = f"{doc_title} — Page {page_num}"
            page_id = f"page-{doc_id}-{page_num}"
            
            pages_data.append({
                "id": page_id,
                "document_id": doc_id,
                "page_number": page_num,
                "title": page_title,
                "content": clean_page_text if clean_page_text else "[No selectable text on this page — possibly scanned or blank]"
            })

            # Create overlapping chunks for this page
            if clean_page_text:
                page_chunks = self._chunk_page_text(
                    page_text=clean_page_text,
                    page_num=page_num,
                    doc_id=doc_id,
                    doc_title=doc_title,
                    filename=clean_name,
                    notebook_id=notebook_id
                )
                all_chunks.extend(page_chunks)

        page_count = len(doc)
        doc.close()

        # Detect scanned / image-only PDFs
        is_scanned = (total_chars < 50)
        scan_warning = None
        if is_scanned:
            scan_warning = (
                "Document text appears empty or scanned. CET AI uses native text extraction without OCR; "
                "scanned image pages cannot be indexed for question answering."
            )

        return {
            "document_id": doc_id,
            "notebook_id": notebook_id,
            "title": doc_title,
            "filename": clean_name,
            "file_path": upload_subpath,
            "page_count": page_count,
            "char_count": total_chars,
            "file_size_bytes": len(file_bytes),
            "is_scanned": is_scanned,
            "scan_warning": scan_warning,
            "pages": pages_data,
            "chunks": all_chunks
        }

    def _chunk_page_text(
        self,
        page_text: str,
        page_num: int,
        doc_id: str,
        doc_title: str,
        filename: str,
        notebook_id: str
    ) -> List[Dict[str, Any]]:
        """
        Splits single-page text into overlapping segments, attempting paragraph/sentence breaks.
        """
        chunks = []
        text_len = len(page_text)

        if text_len <= self.DEFAULT_CHUNK_SIZE:
            chunk_id = f"chunk-{doc_id}-p{page_num}-0"
            chunks.append({
                "chunk_id": chunk_id,
                "notebook_id": notebook_id,
                "document_id": doc_id,
                "document_title": doc_title,
                "filename": filename,
                "page_number": page_num,
                "chunk_index": 0,
                "text": page_text,
                "char_count": len(page_text)
            })
            return chunks

        start = 0
        chunk_idx = 0
        step = self.DEFAULT_CHUNK_SIZE - self.DEFAULT_CHUNK_OVERLAP

        while start < text_len:
            end = min(start + self.DEFAULT_CHUNK_SIZE, text_len)
            
            # If not at the very end of page, try to split at a sentence or newline boundary
            if end < text_len:
                boundary = max(
                    page_text.rfind(".\n", start, end),
                    page_text.rfind(". ", start, end),
                    page_text.rfind("\n\n", start, end),
                    page_text.rfind("\n", start, end)
                )
                if boundary > start + (self.DEFAULT_CHUNK_SIZE // 2):
                    end = boundary + 1

            chunk_text = page_text[start:end].strip()
            if chunk_text:
                chunk_id = f"chunk-{doc_id}-p{page_num}-{chunk_idx}"
                chunks.append({
                    "chunk_id": chunk_id,
                    "notebook_id": notebook_id,
                    "document_id": doc_id,
                    "document_title": doc_title,
                    "filename": filename,
                    "page_number": page_num,
                    "chunk_index": chunk_idx,
                    "text": chunk_text,
                    "char_count": len(chunk_text)
                })
                chunk_idx += 1

            if end >= text_len:
                break
            start += step

        return chunks

document_processor = DocumentProcessor()
