import React, { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Layers, 
  BookOpen, 
  Headphones, 
  Maximize2,
  Minimize2
} from 'lucide-react';
import SummaryView from './SummaryView';
import QuizView from './QuizView';
import FlashcardView from './FlashcardView';
import StudyGuideView from './StudyGuideView';
import AudioOverviewView from './AudioOverviewView';

export default function StudyStudioPanel({ 
  notebook, 
  activeDocument, 
  onCitationClick,
  onUpdateStudyTool,
  initialTab = 'summary' 
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentDocId = activeDocument?.id || notebook?.documentId;
  const currentDocTitle = activeDocument?.filename || notebook?.documentTitle || notebook?.title;

  // Filter study tools to strictly belong to the active document
  const isDocMatch = (item) => {
    if (!item) return false;
    // For user-uploaded documents, NEVER display institutional CET demo data
    if (!activeDocument?.isInstitutional) {
      if (item.documentId && currentDocId) return item.documentId === currentDocId;
      if (item.documentTitle && currentDocTitle) return item.documentTitle.toLowerCase() === currentDocTitle.toLowerCase();
      return false;
    }
    // For official institutional documents
    if (item.documentId && currentDocId) return item.documentId === currentDocId;
    if (item.documentTitle && currentDocTitle) return item.documentTitle.toLowerCase() === currentDocTitle.toLowerCase();
    return true;
  };

  const activeSummary = isDocMatch(notebook?.summary) ? notebook.summary : null;
  const activeQuizzes = (Array.isArray(notebook?.quizzes) && (notebook.quizzesDocumentId === currentDocId || isDocMatch(notebook.quizzes[0]))) ? notebook.quizzes : null;
  const activeFlashcards = (Array.isArray(notebook?.flashcards) && (notebook.flashcardsDocumentId === currentDocId || isDocMatch(notebook.flashcards[0]))) ? notebook.flashcards : null;
  const activeStudyGuide = isDocMatch(notebook?.studyGuide) ? notebook.studyGuide : null;
  const activeAudio = isDocMatch(notebook?.audioOverview) ? notebook.audioOverview : null;

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText, count: activeSummary ? '1' : null },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, count: activeQuizzes?.length },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, count: activeFlashcards?.length },
    { id: 'guide', label: 'Study Guide', icon: BookOpen, count: activeStudyGuide?.units?.length ? `${activeStudyGuide.units.length} Units` : null },
    { id: 'audio', label: 'Audio Overview', icon: Headphones, badge: activeAudio ? 'Neural' : null }
  ];

  return (
    <div className={`study-studio-container ${isExpanded ? 'studio-expanded' : ''}`}>
      {/* Studio Top Navigation Bar */}
      <div className="studio-tabs-bar">
        <div className="studio-tabs-scroll">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`studio-tab-btn ${isActive ? 'active' : ''}`}
                aria-selected={isActive}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count !== undefined && (
                  <span className="tab-count-badge font-mono">{tab.count}</span>
                )}
                {tab.badge && (
                  <span className="tab-pill-badge">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        <button 
          className="studio-expand-btn hide-on-mobile"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Restore split layout' : 'Expand studio panel'}
        >
          {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="studio-content-viewport">
        {activeTab === 'summary' && (
          <SummaryView 
            summary={activeSummary} 
            documentTitle={currentDocTitle} 
            notebookId={notebook?.id}
            documentId={currentDocId}
            onSaveSummary={(summaryData) => onUpdateStudyTool?.(notebook?.id, 'summary', { ...summaryData, documentId: currentDocId, documentTitle: currentDocTitle })}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView 
            quizzes={activeQuizzes} 
            onCitationClick={onCitationClick} 
            notebookId={notebook?.id}
            documentId={currentDocId}
            documentTitle={currentDocTitle}
            onSaveQuizzes={(quizData) => onUpdateStudyTool?.(notebook?.id, 'quizzes', quizData, { documentId: currentDocId })}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardView 
            flashcards={activeFlashcards} 
            onCitationClick={onCitationClick} 
            notebookId={notebook?.id}
            documentId={currentDocId}
            documentTitle={currentDocTitle}
            onSaveFlashcards={(cardsData) => onUpdateStudyTool?.(notebook?.id, 'flashcards', cardsData, { documentId: currentDocId })}
          />
        )}

        {activeTab === 'guide' && (
          <StudyGuideView 
            studyGuide={activeStudyGuide} 
            notebookTitle={notebook?.title} 
            notebookId={notebook?.id}
            documentId={currentDocId}
            documentTitle={currentDocTitle}
            onSaveStudyGuide={(guideData) => onUpdateStudyTool?.(notebook?.id, 'studyGuide', { ...guideData, documentId: currentDocId, documentTitle: currentDocTitle })}
          />
        )}

        {activeTab === 'audio' && (
          <AudioOverviewView 
            audioOverview={activeAudio} 
            notebookTitle={notebook?.title} 
          />
        )}
      </div>
    </div>
  );
}
