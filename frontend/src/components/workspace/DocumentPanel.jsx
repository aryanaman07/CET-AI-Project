/**
 * IITP CET AI — Document Viewer Panel (components/workspace/DocumentPanel.jsx)
 * -----------------------------------------------------------------------------
 * The left panel of the academic study workspace:
 *   1. Page Navigation: Flip between pages or jump directly to specific page numbers.
 *   2. Dual View Modes:
 *      - Academic Reader: Renders text as clean formatted blocks (headings, feature pills, code blocks).
 *      - Raw Text View: Shows the unformatted extracted text stream.
 *   3. Zoom & Accessibility: Adjustable zoom controls (80% - 150%).
 *   4. Citation Jumping: Automatically switches to the cited page when a user clicks
 *      a source badge in the chat or study studio panel.
 *   5. Scanned PDF Warning: Displays an informative notice if the document has low character density.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Upload, 
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Sparkles,
  AlignLeft,
  Bookmark,
  Image,
  Code
} from 'lucide-react';
import { parseAcademicBlocks, cleanRawAcademicText } from '../../utils/academicFormatter';

export default function DocumentPanel({ 
  document, 
  allDocuments = [], 
  onSwitchDocument, 
  onOpenUpload,
  onDeleteDocument,
  highlightedPage = null,
  highlightedText = null 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [readerMode, setReaderMode] = useState('formatted'); // 'formatted' | 'raw'
  const [pageInput, setPageInput] = useState('1');

  // If a citation is clicked from chat, jump to that page
  useEffect(() => {
    if (highlightedPage) {
      const pageToJump = Math.min(Math.max(1, highlightedPage), document?.pages?.length || 1);
      setCurrentPage(pageToJump);
      setPageInput(String(pageToJump));
    }
  }, [highlightedPage, document?.id, document?.pages?.length]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const totalPages = document?.pages?.length || 1;
  const activePageData = document?.pages?.[currentPage - 1] || {
    pageNumber: currentPage,
    title: document?.title || '',
    content: "Content loading or document empty."
  };

  // Parse structured academic blocks for formatted mode (called unconditionally before early returns)
  const academicBlocks = useMemo(() => {
    return parseAcademicBlocks(activePageData?.content || '');
  }, [activePageData?.content]);

  // Clean raw text fallback (called unconditionally before early returns)
  const cleanedRawText = useMemo(() => {
    return cleanRawAcademicText(activePageData?.content || '');
  }, [activePageData?.content]);

  if (!document) {
    return (
      <div className="doc-panel-empty card">
        <FileText size={40} className="text-muted" />
        <p>No document attached to this notebook.</p>
        <button className="btn btn-primary btn-sm" onClick={onOpenUpload}>
          <Upload size={14} />
          <span>Upload PDF</span>
        </button>
      </div>
    );
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 150) setZoomLevel(zoomLevel + 15);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 85) setZoomLevel(zoomLevel - 15);
  };

  const handleDelete = () => {
    if (!onDeleteDocument) return;
    const confirmMsg = `Remove document "${document.filename}" from this notebook? The vector index will be automatically rebuilt.`;
    if (window.confirm(confirmMsg)) {
      onDeleteDocument(document.id);
    }
  };


  // Precise text highlighter that avoids whole-paragraph box clashing
  const renderHighlightedText = (text) => {
    if (
      !highlightedPage || 
      highlightedPage !== currentPage || 
      !highlightedText || 
      highlightedText.trim().length < 3
    ) {
      return text;
    }

    try {
      const cleanSearch = highlightedText.trim();
      const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = text.split(regex);
      if (parts.length <= 1) return text;

      return parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="citation-highlight animate-pulse-glow">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  const isBlockMatchingCitation = (text) => {
    if (!highlightedPage || highlightedPage !== currentPage || !highlightedText || highlightedText.trim().length < 3) {
      return false;
    }
    return text.toLowerCase().includes(highlightedText.trim().toLowerCase());
  };

  return (
    <div className="document-panel-container">
      {/* Document Panel Header */}
      <div className="doc-panel-header">
        <div className="doc-header-top">
          <div className="doc-title-row">
            <FileText size={18} className="text-gold" />
            <select
              className="doc-switcher-select font-mono"
              value={document.id}
              onChange={(e) => onSwitchDocument(e.target.value)}
              title="Switch active document in this notebook"
            >
              {allDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename} {doc.isInstitutional ? '★ [Official]' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="doc-header-actions" style={{ display: 'flex', gap: '6px' }}>
            {onDeleteDocument && !document.isInstitutional && (
              <button 
                className="btn btn-ghost btn-sm text-error" 
                onClick={handleDelete}
                title="Remove this PDF from notebook"
                style={{ color: '#ef4444', padding: '4px 8px' }}
              >
                <Trash2 size={13} />
                <span className="hide-on-mobile">Remove</span>
              </button>
            )}
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onOpenUpload}
              title="Upload another PDF to this notebook"
            >
              <Upload size={13} />
              <span className="hide-on-mobile">Add PDF</span>
            </button>
          </div>
        </div>

        {/* OCR Scanned Notice if applicable */}
        {(document.isScanned || document.scanWarning) && (
          <div className="scanned-doc-banner animate-fade-in" style={{ margin: '4px 0 8px 0', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0 }} />
            <span><strong>OCR Notice:</strong> Scanned / image-only PDF detected. Pure text extraction found minimal text; OCR required for deep QA.</span>
          </div>
        )}

        {/* Page & Zoom Toolbar */}
        <div className="doc-toolbar">
          <div className="page-nav-controls">
            <button 
              className="doc-tool-btn" 
              onClick={handlePrevPage} 
              disabled={currentPage <= 1}
              aria-label="Previous page"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <form onSubmit={handlePageInputSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span className="page-indicator font-mono" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Page 
                <input 
                  type="text" 
                  value={pageInput} 
                  onChange={handlePageInputChange} 
                  onBlur={handlePageInputSubmit}
                  className="page-jump-input font-mono"
                  style={{
                    width: '38px',
                    textAlign: 'center',
                    padding: '2px 4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-medium)',
                    borderRadius: '4px',
                    background: 'var(--bg-subtle)',
                    color: 'var(--iitp-navy-900)'
                  }}
                  title="Type page number and press Enter"
                />
                of {totalPages}
              </span>
            </form>

            <button 
              className="doc-tool-btn" 
              onClick={handleNextPage} 
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Format Mode Toggle */}
            <div className="doc-format-toggle" style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.05)', padding: '2px', borderRadius: '6px' }}>
              <button 
                type="button"
                className={`doc-mode-btn ${readerMode === 'formatted' ? 'active' : ''}`}
                onClick={() => setReaderMode('formatted')}
                title="Structured academic reading mode with clean formatting and lists"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: readerMode === 'formatted' ? '#ffffff' : 'transparent',
                  color: readerMode === 'formatted' ? 'var(--iitp-navy-900)' : 'var(--text-secondary)',
                  boxShadow: readerMode === 'formatted' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Sparkles size={12} className={readerMode === 'formatted' ? 'text-gold' : ''} />
                <span className="hide-on-mobile">Formatted</span>
              </button>
              <button 
                type="button"
                className={`doc-mode-btn ${readerMode === 'raw' ? 'active' : ''}`}
                onClick={() => setReaderMode('raw')}
                title="Continuous raw text flow mode"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: readerMode === 'raw' ? '#ffffff' : 'transparent',
                  color: readerMode === 'raw' ? 'var(--iitp-navy-900)' : 'var(--text-secondary)',
                  boxShadow: readerMode === 'raw' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <AlignLeft size={12} />
                <span className="hide-on-mobile">Original Flow</span>
              </button>
            </div>

            <div className="zoom-controls">
              <button className="doc-tool-btn" onClick={handleZoomOut} title="Zoom out">
                <ZoomOut size={14} />
              </button>
              <span className="zoom-level-text font-mono">{zoomLevel}%</span>
              <button className="doc-tool-btn" onClick={handleZoomIn} title="Zoom in">
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Academic Canvas Viewport */}
      <div className="doc-canvas-viewport">
        <div 
          className="doc-page-sheet animate-fade-in"
          style={{ 
            transform: `scale(${zoomLevel / 100})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease'
          }}
        >
          {/* Sheet Header */}
          <div className="sheet-header">
            <div className="sheet-watermark">
              {document.isInstitutional ? (
                <span className="badge badge-official">
                  <ShieldCheck size={11} /> Verified Official CET Record
                </span>
              ) : (
                <span className="badge badge-sample">
                  Verified Academic Study Material
                </span>
              )}
            </div>
            <span className="sheet-page-stamp font-mono">Page {currentPage} of {totalPages}</span>
          </div>

          <h3 className="sheet-title">{activePageData.title}</h3>

          {/* Formatted Content */}
          <div className="sheet-body-text">
            {readerMode === 'formatted' ? (
              // Structured Academic Rendering
              academicBlocks.map((block, idx) => {
                if (block.type === 'heading') {
                  return (
                    <div key={idx} className="doc-section-heading">
                      <span className="doc-heading-badge font-mono">Topic</span>
                      <h4>{renderHighlightedText(block.text)}</h4>
                    </div>
                  );
                }

                if (block.type === 'lead_title') {
                  return (
                    <div key={idx} className="doc-lead-title">
                      <span className="lead-accent-bar"></span>
                      <h5>{renderHighlightedText(block.text)}</h5>
                    </div>
                  );
                }

                if (block.type === 'figure') {
                  return (
                    <div key={idx} className="doc-figure-caption">
                      <Image size={13} className="text-navy" />
                      <span className="font-semibold">{renderHighlightedText(block.text)}</span>
                    </div>
                  );
                }

                if (block.type === 'bullet_list') {
                  return (
                    <ul key={idx} className="doc-bullet-list">
                      {block.items.map((item, itemIdx) => {
                        const isMatch = isBlockMatchingCitation(item);
                        return (
                          <li 
                            key={itemIdx} 
                            className={`doc-bullet-item ${isMatch ? 'item-citation-active' : ''}`}
                          >
                            <span className="bullet-dot">•</span>
                            <span className="bullet-text">{renderHighlightedText(item)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                if (block.type === 'feature_grid') {
                  return (
                    <div key={idx} className="doc-feature-grid-wrapper">
                      <div className="doc-feature-header">
                        <Bookmark size={12} className="text-gold" />
                        <span>{block.title}</span>
                      </div>
                      <div className="doc-features-cloud">
                        {block.items.map((feature, fIdx) => (
                          <span key={fIdx} className="doc-feature-pill font-mono">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (block.type === 'code_symbols') {
                  return (
                    <div key={idx} className="doc-code-block">
                      <div className="code-block-header">
                        <Code size={12} className="text-muted" />
                        <span className="font-mono text-xs">Syntax Character Set</span>
                      </div>
                      <code className="font-mono text-xs doc-symbol-code">
                        {renderHighlightedText(block.text)}
                      </code>
                    </div>
                  );
                }

                // Standard paragraph
                const isMatch = isBlockMatchingCitation(block.text);
                return (
                  <p 
                    key={idx} 
                    className={`sheet-paragraph ${isMatch ? 'paragraph-citation-active' : ''}`}
                  >
                    {renderHighlightedText(block.text)}
                  </p>
                );
              })
            ) : (
              // Continuous Raw Paragraph Flow
              cleanedRawText.split('\n\n').map((paragraph, pIdx) => {
                const isMatch = isBlockMatchingCitation(paragraph);
                return (
                  <p 
                    key={pIdx} 
                    className={`sheet-paragraph ${isMatch ? 'paragraph-citation-active' : ''}`}
                  >
                    {renderHighlightedText(paragraph)}
                  </p>
                );
              })
            )}
          </div>

          {/* Sheet Footer */}
          <div className="sheet-footer font-mono text-xs text-muted">
            <span>IIT Patna CET AI Academic Knowledge Engine</span>
            <span>{document.filename}</span>
          </div>
        </div>
      </div>

      {/* Page Thumbnails Jump Bar */}
      <div className="doc-thumbnails-bar">
        {document.pages?.map((page) => (
          <button
            key={page.pageNumber}
            className={`thumb-jump-pill ${currentPage === page.pageNumber ? 'active' : ''}`}
            onClick={() => setCurrentPage(page.pageNumber)}
            title={`Go to page ${page.pageNumber}`}
          >
            <span>P.{page.pageNumber}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
