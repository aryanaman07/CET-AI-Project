import React, { useState } from 'react';
import { 
  ChevronLeft, 
  FileText, 
  Upload, 
  Layers, 
  Edit3, 
  Check, 
  MessageSquare
} from 'lucide-react';
import DocumentPanel from './DocumentPanel';
import ChatPanel from './ChatPanel';
import StudyStudioPanel from './StudyStudioPanel';

export default function WorkspaceView({ 
  notebook, 
  allDocuments = [], 
  onBackToDashboard, 
  onUpdateNotebookTitle, 
  onSwitchDocument, 
  onOpenUploadModal,
  onDeleteDocument,
  onAddChatMessage,
  onClearChatHistory,
  onUpdateStudyTool,
  initialStudioTab = 'summary'
}) {
  const [highlightedCitation, setHighlightedCitation] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(notebook?.title || '');
  // For mobile / tablet: tab switcher between 'doc' | 'chat' | 'studio'
  const [mobileActivePanel, setMobileActivePanel] = useState('chat');

  if (!notebook) {
    return (
      <div className="workspace-empty container py-12 text-center">
        <h2>No notebook selected</h2>
        <button className="btn btn-gold mt-4" onClick={onBackToDashboard}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Active document resolution
  const activeDocument = allDocuments.find(d => d.id === notebook.documentId) || allDocuments[0];

  const handleCitationClick = (citation) => {
    setHighlightedCitation(citation);
    if (citation.docName) {
      const targetDoc = allDocuments.find(d => 
        d.filename === citation.docName || d.title === citation.docName
      );
      if (targetDoc && targetDoc.id !== notebook.documentId) {
        onSwitchDocument(notebook.id, targetDoc.id);
      }
    }
    // If on mobile/tablet, switch to document view so student sees highlighted page
    if (window.innerWidth < 1024) {
      setMobileActivePanel('doc');
    }
  };

  const handleSaveTitle = () => {
    if (titleDraft.trim()) {
      onUpdateNotebookTitle(notebook.id, titleDraft.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="workspace-page animate-fade-in">
      {/* Top Workspace Bar */}
      <div className="workspace-top-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onBackToDashboard}
              title="Return to My Notebooks"
            >
              <ChevronLeft size={16} />
              <span className="hide-on-mobile">Dashboard</span>
            </button>

            <div className="title-wrapper">
              {isEditingTitle ? (
                <div className="title-edit-row">
                  <input
                    type="text"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    className="title-edit-input font-bold"
                    autoFocus
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  />
                  <button className="btn btn-gold btn-sm" onClick={handleSaveTitle}>
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="title-display-row" onClick={() => setIsEditingTitle(true)}>
                  <h1 className="workspace-notebook-title">{notebook.title}</h1>
                  <Edit3 size={14} className="edit-icon text-muted" />
                </div>
              )}
              <div className="workspace-meta-pills">
                <span className="badge badge-navy font-mono">{notebook.programTag}</span>
                {notebook.isSampleData ? (
                  <span className="badge badge-sample">Demo Notebook</span>
                ) : (
                  <span className="badge badge-official">Custom Study Session</span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Panel Switcher (Only visible on screens <1024px) */}
          <div className="mobile-view-tabs show-on-mobile-tablet">
            <button 
              className={`mobile-tab-btn ${mobileActivePanel === 'doc' ? 'active' : ''}`}
              onClick={() => setMobileActivePanel('doc')}
            >
              <FileText size={14} />
              <span>Document</span>
            </button>
            <button 
              className={`mobile-tab-btn ${mobileActivePanel === 'chat' ? 'active' : ''}`}
              onClick={() => setMobileActivePanel('chat')}
            >
              <MessageSquare size={14} />
              <span>AI Chat</span>
            </button>
            <button 
              className={`mobile-tab-btn ${mobileActivePanel === 'studio' ? 'active' : ''}`}
              onClick={() => setMobileActivePanel('studio')}
            >
              <Layers size={14} />
              <span>Study Studio</span>
            </button>
          </div>

          <div className="top-bar-right hide-on-mobile">
            <button 
              className="btn btn-gold btn-sm"
              onClick={onOpenUploadModal}
              title="Add PDF to this notebook"
            >
              <Upload size={14} />
              <span>Attach PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Panel Split Workspace Layout */}
      <div className="workspace-panels-grid">
        {/* Panel 1: Source / Document Viewer (Left) */}
        <section 
          className={`workspace-panel panel-document ${mobileActivePanel === 'doc' ? 'mobile-visible' : 'mobile-hidden'}`}
          aria-label="Source Document Previewer"
        >
          <DocumentPanel 
            document={activeDocument} 
            allDocuments={allDocuments}
            onSwitchDocument={(docId) => onSwitchDocument(notebook.id, docId)}
            onOpenUpload={onOpenUploadModal}
            onDeleteDocument={onDeleteDocument ? (docId) => onDeleteDocument(notebook.id, docId) : undefined}
            highlightedPage={highlightedCitation?.page}
            highlightedText={highlightedCitation?.label}
          />
        </section>

        {/* Panel 2: Central AI Chat Panel (Center) */}
        <section 
          className={`workspace-panel panel-chat ${mobileActivePanel === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}
          aria-label="Central AI Conversational Copilot"
        >
          <ChatPanel 
            notebook={notebook}
            activeDocument={activeDocument}
            onCitationClick={handleCitationClick}
            onAddMessage={(msg) => onAddChatMessage(notebook.id, msg)}
            onClearHistory={() => onClearChatHistory(notebook.id)}
          />
        </section>

        {/* Panel 3: Study Tools Studio Panel (Right) */}
        <section 
          className={`workspace-panel panel-studio ${mobileActivePanel === 'studio' ? 'mobile-visible' : 'mobile-hidden'}`}
          aria-label="Study Tools Studio"
        >
          <StudyStudioPanel 
            notebook={notebook}
            activeDocument={activeDocument}
            onCitationClick={handleCitationClick}
            onUpdateStudyTool={onUpdateStudyTool}
            initialTab={initialStudioTab}
          />
        </section>
      </div>
    </div>
  );
}
