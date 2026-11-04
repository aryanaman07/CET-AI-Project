import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  FileText,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { generateDiagnosticQuiz } from '../../services/api';

export default function QuizView({ 
  quizzes = [], 
  onCitationClick, 
  notebookId, 
  documentId, 
  documentTitle, 
  onSaveQuizzes 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [selectedNumQuestions, setSelectedNumQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleGenerate = async (numToGenerate = selectedNumQuestions) => {
    if (!notebookId) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await generateDiagnosticQuiz(notebookId, documentId, numToGenerate);
      if (onSaveQuizzes && result.quizzes) {
        onSaveQuizzes(result.quizzes);
        setSelectedAnswers({});
        setCurrentIndex(0);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate diagnostic quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
  };

  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const currentQuestion = safeQuizzes[currentIndex] || null;
  const totalQuestions = safeQuizzes.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isCurrentAnswered = currentQuestion && selectedAnswers[currentIndex] !== undefined;
  const selectedOptionIdx = selectedAnswers[currentIndex];
  const isCurrentCorrect = isCurrentAnswered && selectedOptionIdx === currentQuestion.correctAnswer;

  const correctCount = Object.entries(selectedAnswers).reduce((acc, [qIdx, ansIdx]) => {
    return ansIdx === safeQuizzes[parseInt(qIdx, 10)]?.correctAnswer ? acc + 1 : acc;
  }, 0);

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleSelectOption = (optIdx) => {
    if (isCurrentAnswered) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optIdx
    }));
  };

  return (
    <div className="quiz-view-container animate-fade-in">
      {/* Top Controls Bar */}
      <div className="summary-actions-toolbar card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div className="toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">
            <Sparkles size={13} /> AI Diagnostic Quiz Studio
          </span>
          <span className="doc-source-label text-muted font-mono text-xs">
            Source: <strong>{documentTitle || 'Notebook Materials'}</strong>
          </span>
          <div className="summary-length-selector" style={{ display: 'inline-flex', gap: '4px', background: 'rgba(0,0,0,0.04)', padding: '2px', borderRadius: '6px' }}>
            {[5, 10, 15].map((count) => (
              <button
                key={count}
                className={`btn btn-xs ${selectedNumQuestions === count ? 'btn-navy' : 'btn-ghost'}`}
                style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                onClick={() => {
                  setSelectedNumQuestions(count);
                  if (safeQuizzes.length > 0) {
                    handleGenerate(count);
                  }
                }}
                disabled={isLoading}
              >
                {count} MCQs
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-right" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-gold btn-sm" 
            onClick={() => handleGenerate(selectedNumQuestions)}
            disabled={isLoading}
            title="Generate diagnostic quiz from uploaded PDF"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>{isLoading ? 'Synthesizing...' : safeQuizzes.length > 0 ? 'New Quiz' : 'Generate Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="card animate-fade-in" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} className="text-error" />
            <span style={{ fontSize: '0.85rem' }}>{errorMsg}</span>
          </div>
          <button className="btn btn-secondary btn-xs" onClick={() => handleGenerate(selectedNumQuestions)}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="studio-empty-state card animate-fade-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Loader2 size={36} className="text-gold animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Generating Diagnostic Questions...</h4>
          <p className="text-muted text-sm" style={{ maxWidth: '420px', margin: '4px auto 0 auto' }}>
            Formulating {selectedNumQuestions} multi-choice questions with 4 distinct options and source citations grounded in <strong>{documentTitle || 'your document'}</strong>.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && safeQuizzes.length === 0 && !errorMsg && (
        <div className="studio-empty-state card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <HelpCircle size={44} className="text-muted" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-navy)' }}>
            No Quiz Generated Yet
          </h3>
          <p className="text-muted text-sm" style={{ maxWidth: '440px', margin: '6px auto 16px auto' }}>
            Test your comprehension of <strong>{documentTitle || 'this material'}</strong> with AI-generated multiple-choice questions, instant scoring, and page-by-page citations.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button className="btn btn-gold" onClick={() => handleGenerate(selectedNumQuestions)}>
              <Sparkles size={16} />
              <span>Generate {selectedNumQuestions}-Question Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Quiz Content */}
      {!isLoading && safeQuizzes.length > 0 && currentQuestion && (
        <>
          {/* Quiz Progress & Score Top Bar */}
          <div className="quiz-top-bar card">
            <div className="quiz-top-left">
              <span className="quiz-counter-text font-bold">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <div className="quiz-progress-track">
                <div 
                  className="quiz-progress-bar"
                  style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="quiz-top-right">
              <div className="score-badge">
                <Award size={15} className="text-gold" />
                <span className="font-mono">
                  Score: <strong>{correctCount}</strong>/{answeredCount} ({answeredCount > 0 ? percentage : 0}%)
                </span>
              </div>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={handleResetQuiz}
                title="Reset and retake quiz"
              >
                <RotateCcw size={14} />
                <span className="hide-on-mobile">Reset</span>
              </button>
            </div>
          </div>

          {/* Question Selector Pills */}
          <div className="quiz-nav-pills">
            {quizzes.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isCorrect = isAnswered && selectedAnswers[idx] === quizzes[idx].correctAnswer;
              let statusClass = 'unanswered';
              if (isAnswered) {
                statusClass = isCorrect ? 'correct' : 'incorrect';
              }
              if (currentIndex === idx) {
                statusClass += ' active-pill';
              }

              return (
                <button
                  key={idx}
                  className={`quiz-pill-btn ${statusClass}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          <div className="quiz-question-card card">
            <div className="question-text-box">
              <h3 className="question-title-text">{currentQuestion.question}</h3>
            </div>

            {/* Options List */}
            <div className="quiz-options-list">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = selectedOptionIdx === optIdx;
                const isAnswerKey = currentQuestion.correctAnswer === optIdx;

                let optionClass = 'option-neutral';
                if (isCurrentAnswered) {
                  if (isSelected) {
                    optionClass = isCurrentCorrect ? 'option-correct' : 'option-incorrect';
                  } else if (isAnswerKey) {
                    optionClass = 'option-highlight-correct';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    className={`quiz-option-btn ${optionClass}`}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isCurrentAnswered}
                  >
                    <div className="option-marker">
                      {isCurrentAnswered && isSelected && isCurrentCorrect && (
                        <CheckCircle2 size={18} className="text-success" />
                      )}
                      {isCurrentAnswered && isSelected && !isCurrentCorrect && (
                        <XCircle size={18} className="text-error" />
                      )}
                      {(!isCurrentAnswered || (!isSelected && !isAnswerKey)) && (
                        <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                      )}
                      {isCurrentAnswered && !isSelected && isAnswerKey && (
                        <CheckCircle2 size={18} className="text-success" />
                      )}
                    </div>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Post-Answer Explanation Box */}
            {isCurrentAnswered && (
              <div className={`quiz-explanation-card animate-fade-in ${isCurrentCorrect ? 'exp-correct' : 'exp-incorrect'}`}>
                <div className="exp-header">
                  {isCurrentCorrect ? (
                    <>
                      <CheckCircle2 size={18} className="text-success" />
                      <strong>Correct Answer!</strong>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} className="text-error" />
                      <strong>Incorrect Selection</strong>
                    </>
                  )}
                </div>
                <p className="exp-text">{currentQuestion.explanation}</p>
                {currentQuestion.sourceCitation && (
                  <div className="exp-citation-row">
                    <span className="text-muted text-xs">Verified Source:</span>
                    <button
                      className="citation-badge"
                      onClick={() => {
                        const match = currentQuestion.sourceCitation.match(/Page\s*(\d+)/i);
                        const pageNum = match ? parseInt(match[1], 10) : 1;
                        onCitationClick?.({
                          docName: currentQuestion.sourceCitation.split(',')[0],
                          page: pageNum,
                          label: currentQuestion.sourceCitation
                        });
                      }}
                      title="Highlight this source page in the document preview"
                    >
                      <FileText size={11} />
                      <span>{currentQuestion.sourceCitation}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="quiz-card-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span className="text-muted text-xs font-mono">
                {answeredCount} of {totalQuestions} Answered
              </span>

              <button
                className="btn btn-gold btn-sm"
                onClick={() => setCurrentIndex(prev => Math.min(prev + 1, totalQuestions - 1))}
                disabled={currentIndex === totalQuestions - 1}
              >
                <span>Next Question</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
