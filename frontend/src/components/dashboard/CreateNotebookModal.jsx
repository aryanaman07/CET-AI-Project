/**
 * IITP CET AI — Create Notebook Modal (components/dashboard/CreateNotebookModal.jsx)
 * ---------------------------------------------------------------------------------
 * Handles modal dialog for creating a new isolated academic workspace:
 *   1. Form Inputs:
 *      - Title: Custom name or auto-populated based on selected PDF.
 *      - Program Tag: Degree program classification (BS-AICS, BS-CSDA, BBA-MBA, Regulations, General).
 *      - Topic / Description: Syllabus topic or examination focus.
 *      - Document Selection: Optionally attaches an initial course PDF.
 *   2. Authoritative Sync:
 *      - Asynchronously calls backend API to generate authoritative SQLite notebook ID.
 *      - Guards against double-clicks using `isSubmitting` state.
 */

import React, { useState } from 'react';
import Modal from '../common/Modal';
import { BookPlus, FileText, Check, Loader2 } from 'lucide-react';

export default function CreateNotebookModal({ isOpen, onClose, onCreate, availableDocuments = [] }) {
  const [title, setTitle] = useState('');
  const [programTag, setProgramTag] = useState('BS-AICS');
  const [topic, setTopic] = useState('');
  const [selectedDocId, setSelectedDocId] = useState(availableDocuments[0]?.id || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const programOptions = [
    { value: 'BS-AICS', label: 'BS in AI & Cyber Security' },
    { value: 'BS-CSDA', label: 'BS in Computer Science & Data Analytics' },
    { value: 'BBA-MBA', label: 'Integrated BBA-MBA / Exec MBA' },
    { value: 'MTECH-AI', label: 'M.Tech in AI & Data Science' },
    { value: 'Regulations', label: 'CET Ordinances & Evaluation Scheme' },
    { value: 'General', label: 'Custom Academic Research' }
  ];

  const selectedDoc = availableDocuments.find(d => d.id === selectedDocId) || availableDocuments[0];

  const handleSelectDoc = (doc) => {
    setSelectedDocId(doc.id);
    if (!title.trim()) {
      const cleanDocTitle = doc.filename.replace('.pdf', '').replace(/[-_]/g, ' ');
      setTitle(`${cleanDocTitle.charAt(0).toUpperCase() + cleanDocTitle.slice(1)} Study Session`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Smart title resolution: user typed title -> topic -> clean document name -> default
    const docCleanName = selectedDoc ? selectedDoc.filename.replace('.pdf', '').replace(/[-_]/g, ' ') : 'Academic Study';
    const effectiveTitle = title.trim() || topic.trim() || `${docCleanName.charAt(0).toUpperCase() + docCleanName.slice(1)} Session`;

    setIsSubmitting(true);
    setError('');

    const newNotebookDraft = {
      title: effectiveTitle,
      programTag,
      topic: topic.trim() || 'Curriculum Revision & Notes',
      documentId: selectedDoc?.id || 'doc-aics-curriculum',
      documentTitle: selectedDoc?.filename || 'AICS_Curriculum_2024.pdf',
      lastModified: 'Just now',
      documentCount: 1,
      summaryCount: 1,
      quizCount: 3,
      flashcardCount: 5,
      isSampleData: false,
      description: topic.trim() || `Interactive study notebook for ${programTag}.`,
      chatHistory: [
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `Welcome to **${effectiveTitle}**! I am your CET AI study copilot, grounded in **${selectedDoc?.title || 'your syllabus'}**. You can ask me questions about courses, evaluation rules, or generate flashcards and quizzes using the Study Studio panel on the right.`,
          citations: [
            { docName: selectedDoc?.filename || "AICS_Curriculum_2024.pdf", page: 1, label: `${selectedDoc?.filename || "Curriculum"}, Page 1` }
          ],
          timestamp: 'Just now'
        }
      ],
      summary: {
        executiveSummary: `This notebook tracks study materials for ${effectiveTitle} under the ${programTag} program. Key topics focus on rigorous comprehension, formula mastery, and syllabus requirements.`,
        keyConcepts: [
          { term: "Core Competency", definition: "Foundational mastery of theoretical constructs and empirical implementations required by IIT Patna CET." },
          { term: "Continuous Evaluation", definition: "40% weightage allocated to in-semester quizzes, mid-term examinations, and laboratory assignments." }
        ],
        coreFormulas: [
          { title: "Credit Formula", formula: "Lecture (L) + Tutorial (T) + Practical (P/2) = Total Credits" }
        ],
        examTakeaways: [
          "Review all lecture notes before the scheduled mid-semester examinations.",
          "Maintain at least 75% attendance to avoid examination debarment."
        ]
      },
      quizzes: [
        {
          id: `q-${Date.now()}-1`,
          question: `What is the minimum attendance threshold required by IIT Patna CET to appear in the end-semester examination for ${effectiveTitle}?`,
          options: ["A) 60%", "B) 70%", "C) 75%", "D) 85%"],
          correctAnswer: 2,
          explanation: "Regulation 4 mandates minimum 75% verified attendance to earn credit eligibility.",
          sourceCitation: "Evaluation Scheme, Page 3"
        },
        {
          id: `q-${Date.now()}-2`,
          question: "Under NEP 2020, what award is conferred after completing Year 1 (40 Credits)?",
          options: [
            "A) Undergraduate Certificate",
            "B) Undergraduate Diploma",
            "C) Bachelor of Science",
            "D) Advanced Diploma"
          ],
          correctAnswer: 0,
          explanation: "Stage 1 exit after 40 credits awards the Undergraduate Certificate.",
          sourceCitation: "Curriculum Specification, Page 1"
        }
      ],
      flashcards: [
        {
          id: `fc-${Date.now()}-1`,
          category: programTag,
          front: `What is the primary focus of this notebook: ${effectiveTitle}?`,
          back: `Focused on ${topic.trim() || programTag} coursework, self-assessment quizzes, and grounded document exploration.`,
          source: selectedDoc?.filename || "Curriculum Handbook",
          isMastered: false
        },
        {
          id: `fc-${Date.now()}-2`,
          category: "Grading Scheme",
          front: "What is the weightage split between Continuous Internal Assessment and End-Sem Exams?",
          back: "Continuous Internal Assessment = 40%; End-Semester Central Exam = 60%.",
          source: "Evaluation Scheme, Page 1",
          isMastered: true
        }
      ],
      studyGuide: {
        title: `Study Guide: ${effectiveTitle}`,
        targetExam: "End-Semester Examination",
        units: [
          {
            unitNumber: 1,
            unitName: "Foundations & Core Principles",
            weightage: "40%",
            topics: ["Introduction to core terminology", "Algorithmic and structural methods"],
            mustSolveProblems: ["Formulate proof or design solution for fundamental exercise."]
          }
        ]
      },
      audioOverview: {
        title: `Audio Overview: ${effectiveTitle}`,
        duration: "2:15",
        speaker: "CET AI Academic Speaker",
        script: `Hello and welcome to your custom study session for ${effectiveTitle}. In this audio summary, we review the fundamental concepts from your course documents. Make sure to complete the interactive quiz to reinforce your active recall!`,
        audioUrl: "https://actions.google.com/sounds/v1/science/digital_technology_pulse.ogg"
      }
    };

    try {
      const created = await onCreate(newNotebookDraft);
      if (created) {
        setTitle('');
        setTopic('');
        setError('');
        onClose();
      }
    } catch (err) {
      setError(err?.message || 'Failed to create notebook on backend. Please ensure the backend server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Study Notebook"
      subtitle="Organize course documents, chat with syllabi, and generate active study aids"
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && (
          <div className="form-error-alert animate-fade-in">
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="nb-title" className="form-label">
            Notebook Title <span className="text-error">*</span>
          </label>
          <input
            id="nb-title"
            type="text"
            className="form-input"
            placeholder="e.g., BS AICS — Deep Learning & Neural Architectures"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            autoFocus
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="nb-program" className="form-label">
              Program / Academic Track
            </label>
            <select
              id="nb-program"
              className="form-select"
              value={programTag}
              onChange={(e) => setProgramTag(e.target.value)}
            >
              {programOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nb-topic" className="form-label">
              Topic / Subject Focus
            </label>
            <input
              id="nb-topic"
              type="text"
              className="form-input"
              placeholder="e.g., Mid-Sem Prep / Module 3"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Attach Initial Study Material (PDF)
          </label>
          <div className="doc-select-list">
            {availableDocuments.map((doc) => {
              const isSelected = selectedDocId === doc.id;
              return (
                <div 
                  key={doc.id}
                  className={`doc-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectDoc(doc)}
                >
                  <div className="doc-select-radio">
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <FileText size={18} className="doc-option-icon" />
                  <div className="doc-option-info">
                    <span className="doc-option-title">{doc.filename}</span>
                    <span className="doc-option-meta">{doc.title} • {doc.pageCount} pages</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-actions-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <BookPlus size={16} />}
            <span>{isSubmitting ? 'Creating...' : 'Create & Launch Notebook'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
