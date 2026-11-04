import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { PRELOADED_DOCUMENTS } from '../../data/cetData';
import { uploadNotebookDocument, fetchNotebookDocumentPages } from '../../services/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess, currentNotebookTitle, currentNotebookId = 'nb-aics-dsa' }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'done' | 'error'
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [scanWarning, setScanWarning] = useState('');
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setProgress(0);
    setStatusMessage('');
    setErrorMessage('');
    setScanWarning('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateAndProcessFile = async (file) => {
    setErrorMessage('');
    setScanWarning('');
    if (!file) return;

    // Check extension
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Invalid file format. Only PDF documents (.pdf) are supported.');
      setUploadState('error');
      return;
    }

    // Check size limit: 50MB
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 50 MB.`);
      setUploadState('error');
      return;
    }

    setSelectedFile(file);
    await startRealIngestion(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handlePickPreloaded = (preloadedDoc) => {
    setSelectedFile({
      name: preloadedDoc.filename,
      size: 2 * 1024 * 1024,
      isPreloaded: true,
      data: preloadedDoc
    });
    setUploadState('done');
    setProgress(100);
    setStatusMessage('Official handbook ready in workspace!');
    setTimeout(() => {
      onUploadSuccess(preloadedDoc);
      handleClose();
    }, 600);
  };

  const startRealIngestion = async (file) => {
    setUploadState('uploading');
    setProgress(20);
    setStatusMessage('Validating and streaming PDF to CET AI backend...');

    // Smooth ticker so the user gets real-time responsive visual feedback
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < 40) return prev + 10;
        if (prev < 70) {
          setStatusMessage('Extracting pages & text structure via PyMuPDF...');
          return prev + 6;
        }
        if (prev < 90) {
          setStatusMessage('Indexing chunks in isolated FAISS vector space...');
          return prev + 4;
        }
        return prev;
      });
    }, 200);

    try {
      const uploadResult = await uploadNotebookDocument(currentNotebookId, file);
      clearInterval(progressTimer);
      
      setProgress(95);
      setStatusMessage(`Vectorized ${uploadResult.chunks_indexed} chunks in FAISS index...`);

      // Fetch real extracted pages
      let pages = [];
      try {
        const rawPages = await fetchNotebookDocumentPages(currentNotebookId, uploadResult.document_id);
        if (rawPages && rawPages.length > 0) {
          pages = rawPages.map(p => ({
            pageNumber: p.page_number,
            title: p.title,
            content: p.content
          }));
        }
      } catch (err) {
        console.warn("Could not fetch page details:", err);
      }

      if (pages.length === 0) {
        // Fallback placeholder page
        pages = [{
          pageNumber: 1,
          title: `${uploadResult.filename} — Overview`,
          content: `Document: ${uploadResult.filename}\nPages: ${uploadResult.page_count}\nChunks indexed: ${uploadResult.chunks_indexed}\nStatus: Ready for semantic search and Q&A.`
        }];
      }

      const newDoc = {
        id: uploadResult.document_id,
        notebookId: currentNotebookId,
        title: uploadResult.title,
        filename: uploadResult.filename,
        category: 'Uploaded Study Material',
        isInstitutional: false,
        pageCount: uploadResult.page_count,
        charCount: uploadResult.char_count,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        isScanned: uploadResult.is_scanned,
        scanWarning: uploadResult.scan_warning,
        pages: pages
      };

      setProgress(100);
      setUploadState('done');
      if (uploadResult.scan_warning) {
        setScanWarning(uploadResult.scan_warning);
      }
      setStatusMessage(`Successfully indexed ${uploadResult.page_count} pages and ${uploadResult.chunks_indexed} vector chunks!`);

      setTimeout(() => {
        onUploadSuccess(newDoc);
        handleClose();
      }, 900);

    } catch (err) {
      clearInterval(progressTimer);
      console.error("Upload failed:", err);
      setErrorMessage(err.message || "Failed to process document on backend.");
      setUploadState('error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Study Material (PDF)"
      subtitle={`Ingest course handouts, syllabi, or research papers into "${currentNotebookTitle || 'Active Notebook'}"`}
      maxWidth="620px"
    >
      <div className="upload-modal-content">
        {errorMessage && (
          <div className="upload-error-banner animate-fade-in">
            <AlertCircle size={18} className="text-error" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dropzone */}
        {uploadState === 'idle' || uploadState === 'error' ? (
          <>
            <div 
              className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInputChange} 
                accept=".pdf,application/pdf" 
                style={{ display: 'none' }} 
              />
              <div className="dropzone-icon-circle">
                <UploadCloud size={32} className="text-navy" />
              </div>
              <h4 className="dropzone-title">Click to upload or drag & drop PDF</h4>
              <p className="dropzone-subtitle">
                Supports syllabus PDFs, lecture slides, academic textbooks, or notes (Maximum 50 MB, up to 500 pages)
              </p>
              <div className="dropzone-badge-row">
                <span className="badge badge-navy">PDF Only</span>
                <span className="badge badge-gold">Max 50 MB</span>
                <span className="badge badge-gold">Up to 500 Pages</span>
                <span className="badge badge-official">Grounded RAG Ingestion</span>
              </div>
            </div>

            {/* Quick Pick Official CET Handbooks */}
            <div className="preloaded-picker-section">
              <div className="picker-header">
                <BookOpen size={16} className="text-gold" />
                <span>Or Select an Official IIT Patna CET Handbook:</span>
              </div>
              <div className="preloaded-grid">
                {PRELOADED_DOCUMENTS.map((doc) => (
                  <button 
                    key={doc.id}
                    className="preloaded-doc-chip"
                    onClick={() => handlePickPreloaded(doc)}
                    type="button"
                  >
                    <FileText size={15} className="text-navy" />
                    <div className="chip-text">
                      <span className="chip-name">{doc.filename}</span>
                      <span className="chip-sub">{doc.pageCount} pages • {doc.fileSize}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Upload Progress & Ingestion Animation */
          <div className="upload-progress-card animate-fade-in">
            <div className="progress-header">
              {uploadState === 'done' ? (
                <div className="status-icon-circle success animate-fade-in">
                  <CheckCircle2 size={36} className="text-success" />
                </div>
              ) : (
                <div className="status-icon-circle spinning">
                  <Loader2 size={36} className="spinner-icon text-navy" />
                </div>
              )}
              <h4 className="progress-status-title">
                {uploadState === 'done' ? 'Document Ready!' : 'Ingesting Academic Document'}
              </h4>
              <p className="progress-filename font-mono">{selectedFile?.name}</p>
              <p className="progress-submessage">{statusMessage}</p>
            </div>

            <div className="progress-bar-track">
              <div 
                className={`progress-bar-fill ${uploadState === 'done' ? 'fill-done' : ''}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="progress-step-list">
              <div className={`progress-step-item ${progress >= 30 ? 'completed' : ''}`}>
                <span className="step-num">1</span>
                <span>PDF Format & Size Validation</span>
              </div>
              <div className={`progress-step-item ${progress >= 60 ? 'completed' : ''}`}>
                <span className="step-num">2</span>
                <span>Text Extraction & Metadata Indexing</span>
              </div>
              <div className={`progress-step-item ${progress >= 100 ? 'completed' : ''}`}>
                <span className="step-num">3</span>
                <span>Vector Embeddings & Studio Generation</span>
              </div>
            </div>

            {scanWarning && (
              <div className="upload-warning-banner animate-fade-in" style={{ marginTop: '12px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>OCR Notice:</strong> {scanWarning}</span>
              </div>
            )}
          </div>
        )}

        <div className="upload-modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleClose}
            disabled={uploadState === 'uploading' || uploadState === 'processing'}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
