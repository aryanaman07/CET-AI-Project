import React, { useState } from 'react';
import { 
  Layers, 
  HelpCircle, 
  FileText, 
  BookOpen, 
  Headphones, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import QuizView from '../workspace/QuizView';
import FlashcardView from '../workspace/FlashcardView';
import SummaryView from '../workspace/SummaryView';
import StudyGuideView from '../workspace/StudyGuideView';
import AudioOverviewView from '../workspace/AudioOverviewView';

export default function StudyToolsHubView({ 
  notebooks = [], 
  activeNotebookId, 
  onSelectNotebook,
  onOpenWorkspace,
  onUpdateStudyTool
}) {
  const [selectedTool, setSelectedTool] = useState('quiz');
  const [currentNotebookId, setCurrentNotebookId] = useState(activeNotebookId || notebooks[0]?.id);

  const activeNotebook = notebooks.find(n => n.id === currentNotebookId) || notebooks[0];

  const tools = [
    { 
      id: 'quiz', 
      name: 'Diagnostic Quizzes', 
      icon: HelpCircle, 
      count: `${activeNotebook?.quizzes?.length || 0} MCQs`, 
      desc: 'Test your comprehension with grounded questions and instant grading.' 
    },
    { 
      id: 'flashcards', 
      name: 'Revision Flashcards', 
      icon: Layers, 
      count: `${activeNotebook?.flashcards?.length || 0} Cards`, 
      desc: '3D flipping cards with active recall tracking (Mastered vs. Need Review).' 
    },
    { 
      id: 'summary', 
      name: 'Executive Summaries', 
      icon: FileText, 
      count: 'Formulas & Terms', 
      desc: 'Digest core concepts, definitions, and mathematical equations.' 
    },
    { 
      id: 'guide', 
      name: 'Study Guides', 
      icon: BookOpen, 
      count: 'Unit Breakdown', 
      desc: 'Exam weightages, competency topics, and must-solve problems.' 
    },
    { 
      id: 'audio', 
      name: 'Audio Overviews', 
      icon: Headphones, 
      count: 'Spoken Podcast', 
      desc: 'Listen to 3-minute conversational audio capsules on the go.' 
    }
  ];

  return (
    <div className="tools-hub-page animate-fade-in">
      <div className="container tools-container">
        {/* Hub Header */}
        <div className="tools-header-banner card glass-panel">
          <div className="tools-banner-content">
            <span className="badge badge-gold">
              <Sparkles size={12} /> Active Recall Learning Studio
            </span>
            <h1 className="tools-main-title">Academic Study Tools Suite</h1>
            <p className="tools-subtext">
              Reinforce course comprehension through interactive diagnostics, spaced repetition flashcards, and neural audio summaries.
            </p>
          </div>

          {/* Notebook Selector */}
          <div className="tools-notebook-selector">
            <label className="text-xs font-bold text-muted mb-1 block">Active Study Notebook:</label>
            <select
              className="tools-select-dropdown font-mono"
              value={currentNotebookId}
              onChange={(e) => {
                setCurrentNotebookId(e.target.value);
                onSelectNotebook?.(e.target.value);
              }}
            >
              {notebooks.map(nb => (
                <option key={nb.id} value={nb.id}>
                  {nb.title} ({nb.programTag})
                </option>
              ))}
            </select>
            <button 
              className="btn btn-secondary btn-sm mt-2 w-full"
              onClick={() => onOpenWorkspace(activeNotebook?.id, selectedTool)}
            >
              <span>Open in Split-Screen Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Tool Cards Selector */}
        <div className="tool-selector-grid">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                className={`tool-selector-card card ${isSelected ? 'active-tool' : ''}`}
                onClick={() => setSelectedTool(tool.id)}
              >
                <div className="tool-card-icon-row">
                  <div className={`tool-icon-circle ${isSelected ? 'icon-active' : ''}`}>
                    <Icon size={20} />
                  </div>
                  <span className="badge badge-navy text-xs font-mono">{tool.count}</span>
                </div>
                <h3 className="tool-card-name">{tool.name}</h3>
                <p className="tool-card-desc">{tool.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Active Tool Interactive Canvas */}
        <div className="tool-active-canvas card">
          <div className="tool-canvas-header">
            <div className="canvas-header-title">
              <h2 className="text-lg font-bold">
                {tools.find(t => t.id === selectedTool)?.name}
              </h2>
              <span className="text-muted text-xs font-mono">
                Source Notebook: <strong>{activeNotebook?.title}</strong>
              </span>
            </div>
          </div>

          <div className="tool-canvas-body">
            {selectedTool === 'quiz' && (
              <QuizView 
                quizzes={activeNotebook?.quizzes} 
                onCitationClick={() => onOpenWorkspace(activeNotebook?.id, 'quiz')}
                notebookId={activeNotebook?.id}
                documentId={activeNotebook?.documentId}
                documentTitle={activeNotebook?.documentTitle}
                onSaveQuizzes={(quizData) => onUpdateStudyTool?.(activeNotebook?.id, 'quizzes', quizData)}
              />
            )}

            {selectedTool === 'flashcards' && (
              <FlashcardView 
                flashcards={activeNotebook?.flashcards} 
                onCitationClick={() => onOpenWorkspace(activeNotebook?.id, 'flashcards')}
                notebookId={activeNotebook?.id}
                documentId={activeNotebook?.documentId}
                documentTitle={activeNotebook?.documentTitle}
                onSaveFlashcards={(cardsData) => onUpdateStudyTool?.(activeNotebook?.id, 'flashcards', cardsData)}
              />
            )}

            {selectedTool === 'summary' && (
              <SummaryView 
                summary={activeNotebook?.summary} 
                documentTitle={activeNotebook?.documentTitle} 
                notebookId={activeNotebook?.id}
                documentId={activeNotebook?.documentId}
                onSaveSummary={(summaryData) => onUpdateStudyTool?.(activeNotebook?.id, 'summary', summaryData)}
              />
            )}

            {selectedTool === 'guide' && (
              <StudyGuideView 
                studyGuide={activeNotebook?.studyGuide} 
                notebookTitle={activeNotebook?.title} 
                notebookId={activeNotebook?.id}
                documentId={activeNotebook?.documentId}
                documentTitle={activeNotebook?.documentTitle}
                onSaveStudyGuide={(guideData) => onUpdateStudyTool?.(activeNotebook?.id, 'studyGuide', guideData)}
              />
            )}

            {selectedTool === 'audio' && (
              <AudioOverviewView 
                audioOverview={activeNotebook?.audioOverview} 
                notebookTitle={activeNotebook?.title} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
