import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  Target, 
  Printer, 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { generateComprehensiveStudyGuide } from '../../services/api';

export default function StudyGuideView({ 
  studyGuide, 
  notebookTitle, 
  notebookId, 
  documentId, 
  documentTitle, 
  onSaveStudyGuide 
}) {
  const [targetExam, setTargetExam] = useState(studyGuide?.targetExam || 'Semester Examination');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleGenerate = async (examToUse = targetExam) => {
    if (!notebookId) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await generateComprehensiveStudyGuide(notebookId, documentId, examToUse);
      if (onSaveStudyGuide) {
        onSaveStudyGuide(result);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate comprehensive study guide.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="study-guide-container animate-fade-in">
      {/* Top Controls Bar */}
      <div className="summary-actions-toolbar card no-print" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div className="toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">
            <Sparkles size={13} /> AI Study Guide Generator
          </span>
          <span className="doc-source-label text-muted font-mono text-xs">
            Source: <strong>{documentTitle || notebookTitle || 'Notebook Materials'}</strong>
          </span>
          <select
            className="concept-search-input font-mono"
            style={{ fontSize: '0.78rem', padding: '3px 8px', maxWidth: '200px' }}
            value={targetExam}
            onChange={(e) => {
              setTargetExam(e.target.value);
              if (studyGuide) {
                handleGenerate(e.target.value);
              }
            }}
            disabled={isLoading}
          >
            <option value="Mid-Semester Examination">Mid-Semester Exam</option>
            <option value="End-Semester Examination">End-Semester Exam</option>
            <option value="Lab & Practical Assessment">Lab & Practical</option>
            <option value="Capstone Defense & Viva">Capstone Defense</option>
          </select>
        </div>

        <div className="toolbar-right" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-gold btn-sm" 
            onClick={() => handleGenerate(targetExam)}
            disabled={isLoading}
            title="Generate structured study guide from uploaded PDF"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>{isLoading ? 'Synthesizing...' : studyGuide ? 'Regenerate' : 'Generate Guide'}</span>
          </button>
          {studyGuide && (
            <button className="btn btn-secondary btn-sm" onClick={handlePrint} title="Print study guide">
              <Printer size={14} />
              <span className="hide-on-mobile">Print</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="card animate-fade-in" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} className="text-error" />
            <span style={{ fontSize: '0.85rem' }}>{errorMsg}</span>
          </div>
          <button className="btn btn-secondary btn-xs" onClick={() => handleGenerate(targetExam)}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="studio-empty-state card animate-fade-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Loader2 size={36} className="text-gold animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Compiling Comprehensive Study Guide...</h4>
          <p className="text-muted text-sm" style={{ maxWidth: '420px', margin: '4px auto 0 auto' }}>
            Structuring units, competency checklists, and must-solve problems for <strong>{targetExam}</strong> from <strong>{documentTitle || notebookTitle}</strong>.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !studyGuide && !errorMsg && (
        <div className="studio-empty-state card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <BookOpen size={44} className="text-muted" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-navy)' }}>
            No Study Guide Generated Yet
          </h3>
          <p className="text-muted text-sm" style={{ maxWidth: '440px', margin: '6px auto 16px auto' }}>
            Generate a comprehensive syllabus breakdown with modular competency checklists and must-solve analytical problems for <strong>{documentTitle || notebookTitle}</strong>.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button className="btn btn-gold" onClick={() => handleGenerate(targetExam)}>
              <Sparkles size={16} />
              <span>Generate Study Guide ({targetExam})</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Study Guide Content */}
      {!isLoading && studyGuide && (
        <>
          <div className="guide-header-bar card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
            <div>
              <span className="badge badge-navy">Comprehensive Study Guide</span>
              <h3 className="guide-main-title" style={{ marginTop: '6px', fontSize: '1.25rem', color: 'var(--color-navy)' }}>
                {studyGuide.title || notebookTitle}
              </h3>
              {studyGuide.overview && (
                <p className="text-muted text-sm" style={{ marginTop: '6px' }}>
                  {studyGuide.overview}
                </p>
              )}
              <p className="guide-target-exam text-muted text-xs" style={{ marginTop: '8px' }}>
                Target Milestone: <strong style={{ color: 'var(--color-gold)' }}>{studyGuide.targetExam || targetExam}</strong>
                {studyGuide.engine && (
                  <span className="badge badge-sample text-xs font-mono" style={{ marginLeft: '8px' }}>
                    {studyGuide.engine}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Units List */}
          <div className="guide-units-list">
            {studyGuide.units?.map((unit, idx) => (
              <div key={unit.unitNumber || idx} className="unit-card card">
                <div className="unit-header-row">
                  <div className="unit-title-group">
                    <span className="unit-number-pill">Unit {unit.unitNumber || idx + 1}</span>
                    <h4 className="unit-name">{unit.unitName}</h4>
                  </div>
                  <span className="badge badge-gold font-mono">{unit.weightage}</span>
                </div>

                {/* Topics Checklist */}
                <div className="unit-section">
                  <h5 className="unit-section-title">
                    <Target size={14} className="text-navy" />
                    <span>Core Competency Topics</span>
                  </h5>
                  <ul className="unit-topic-checklist">
                    {unit.topics?.map((topic, tIdx) => (
                      <li key={tIdx} className="unit-topic-item">
                        <span className="topic-checkbox">✓</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Must Solve Problems */}
                {unit.mustSolveProblems && unit.mustSolveProblems.length > 0 && (
                  <div className="unit-section must-solve-section">
                    <h5 className="unit-section-title">
                      <CheckSquare size={14} className="text-gold" />
                      <span>Must-Solve Analytical Problems</span>
                    </h5>
                    <div className="problems-list">
                      {unit.mustSolveProblems.map((prob, pIdx) => (
                        <div key={pIdx} className="problem-box">
                          <span className="problem-idx">Problem {pIdx + 1}:</span>
                          <p className="problem-text font-mono text-sm">{prob}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {unit.sourceCitation && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px' }}>
                    <span className="text-muted text-xs font-mono">
                      Citations: <strong>{unit.sourceCitation}</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
