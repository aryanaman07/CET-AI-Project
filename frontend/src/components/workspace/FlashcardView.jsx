import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Shuffle, 
  RotateCcw,
  Sparkles,
  FileText,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { generateRevisionFlashcards } from '../../services/api';

export default function FlashcardView({ 
  flashcards = [], 
  onCitationClick, 
  notebookId, 
  documentId, 
  documentTitle, 
  onSaveFlashcards 
}) {
  const [deck, setDeck] = useState(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredMap, setMasteredMap] = useState({});
  const [selectedNumCards, setSelectedNumCards] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync external flashcards when prop changes
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setDeck(flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [flashcards]);

  const handleGenerate = async (numToGenerate = selectedNumCards) => {
    if (!notebookId) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await generateRevisionFlashcards(notebookId, documentId, numToGenerate);
      if (result.flashcards && result.flashcards.length > 0) {
        setDeck(result.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setMasteredMap({});
        if (onSaveFlashcards) {
          onSaveFlashcards(result.flashcards);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate revision flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = deck && deck.length > 0 ? deck[currentIndex] : null;
  const totalCards = deck ? deck.length : 0;
  const isCurrentMastered = currentCard ? (masteredMap[currentCard.id] ?? currentCard.isMastered) : false;

  const totalMastered = deck ? deck.filter(c => masteredMap[c.id] ?? c.isMastered).length : 0;
  const masteryPercentage = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % totalCards);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards);
  };

  const toggleMastery = (cardId, status) => {
    setMasteredMap(prev => ({
      ...prev,
      [cardId]: status
    }));
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const handleResetMastery = () => {
    const resetObj = {};
    deck.forEach(c => { resetObj[c.id] = false; });
    setMasteredMap(resetObj);
  };

  return (
    <div className="flashcard-view-container animate-fade-in">
      {/* Top Controls Bar */}
      <div className="summary-actions-toolbar card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div className="toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">
            <Sparkles size={13} /> Active Recall Flashcard Studio
          </span>
          <span className="doc-source-label text-muted font-mono text-xs">
            Source: <strong>{documentTitle || 'Notebook Materials'}</strong>
          </span>
          <div className="summary-length-selector" style={{ display: 'inline-flex', gap: '4px', background: 'rgba(0,0,0,0.04)', padding: '2px', borderRadius: '6px' }}>
            {[8, 12, 16].map((count) => (
              <button
                key={count}
                className={`btn btn-xs ${selectedNumCards === count ? 'btn-navy' : 'btn-ghost'}`}
                style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                onClick={() => {
                  setSelectedNumCards(count);
                  if (deck && deck.length > 0) {
                    handleGenerate(count);
                  }
                }}
                disabled={isLoading}
              >
                {count} Cards
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-right" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-gold btn-sm" 
            onClick={() => handleGenerate(selectedNumCards)}
            disabled={isLoading}
            title="Generate flashcards from uploaded PDF"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>{isLoading ? 'Synthesizing...' : deck && deck.length > 0 ? 'Regenerate Deck' : 'Generate Cards'}</span>
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
          <button className="btn btn-secondary btn-xs" onClick={() => handleGenerate(selectedNumCards)}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="studio-empty-state card animate-fade-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Loader2 size={36} className="text-gold animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Extracting Active Recall Flashcards...</h4>
          <p className="text-muted text-sm" style={{ maxWidth: '420px', margin: '4px auto 0 auto' }}>
            Synthesizing {selectedNumCards} concept cards from <strong>{documentTitle || 'your document'}</strong> with verified definitions and page references.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!deck || deck.length === 0) && !errorMsg && (
        <div className="studio-empty-state card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Sparkles size={44} className="text-muted" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-navy)' }}>
            No Flashcards Generated Yet
          </h3>
          <p className="text-muted text-sm" style={{ maxWidth: '440px', margin: '6px auto 16px auto' }}>
            Master key concepts, formulas, and terminology from <strong>{documentTitle || 'this material'}</strong> using 3D flipping flashcards with active recall mastery tracking.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button className="btn btn-gold" onClick={() => handleGenerate(selectedNumCards)}>
              <Sparkles size={16} />
              <span>Generate {selectedNumCards} Flashcards</span>
            </button>
          </div>
        </div>
      )}

      {/* Flashcard Active Deck */}
      {!isLoading && deck && deck.length > 0 && currentCard && (
        <>
          {/* Top Mastery Progress Bar */}
          <div className="flashcard-top-bar card">
            <div className="top-bar-left">
              <span className="font-bold text-sm">
                Card {currentIndex + 1} of {totalCards}
              </span>
              <div className="mastery-progress-track">
                <div 
                  className="mastery-progress-bar"
                  style={{ width: `${masteryPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="top-bar-right">
              <span className="mastery-count-pill font-mono">
                Mastered: <strong>{totalMastered}</strong>/{totalCards} ({masteryPercentage}%)
              </span>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={handleShuffle} 
                title="Shuffle deck"
              >
                <Shuffle size={14} />
              </button>
              <button 
                className="btn btn-ghost btn-sm text-muted" 
                onClick={handleResetMastery} 
                title="Reset all to review"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* 3D Flashcard Flip Scene */}
          <div className="flashcard-scene" onClick={handleFlip}>
            <div className={`flashcard-card ${isFlipped ? 'is-flipped' : ''}`}>
              {/* Front Face */}
              <div className="flashcard-face flashcard-front">
                <div className="face-header">
                  <span className="badge badge-navy">{currentCard.category || 'Concept'}</span>
                  <span className="flip-hint-text text-muted text-xs">
                    <RotateCw size={12} className="inline-icon" /> Click to flip
                  </span>
                </div>

                <div className="face-content">
                  <h3 className="card-question-text">{currentCard.front}</h3>
                </div>

                <div className="face-footer">
                  <span className="hint-label">Question / Concept Anchor</span>
                  {isCurrentMastered ? (
                    <span className="badge badge-official">✓ Mastered</span>
                  ) : (
                    <span className="badge badge-sample">Needs Review</span>
                  )}
                </div>
              </div>

              {/* Back Face */}
              <div className="flashcard-face flashcard-back">
                <div className="face-header">
                  <span className="badge badge-gold">Verified Answer</span>
                  <span className="flip-hint-text text-light text-xs">
                    <RotateCw size={12} className="inline-icon" /> Click to flip back
                  </span>
                </div>

                <div className="face-content">
                  <p className="card-answer-text">{currentCard.back}</p>
                </div>

                <div className="face-footer" onClick={(e) => e.stopPropagation()}>
                  <div className="source-row">
                    <span className="text-light text-xs">Citation:</span>
                    <button
                      className="citation-badge"
                      onClick={() => {
                        const match = (currentCard.source || '').match(/Page\s*(\d+)/i);
                        const pageNum = match ? parseInt(match[1], 10) : 1;
                        onCitationClick?.({
                          docName: (currentCard.source || '').split(',')[0],
                          page: pageNum,
                          label: currentCard.source
                        });
                      }}
                    >
                      <FileText size={11} />
                      <span>{currentCard.source || documentTitle}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons Bar */}
          <div className="flashcard-controls-panel">
            <div className="nav-buttons-group">
              <button className="btn btn-secondary btn-sm" onClick={handlePrev} title="Previous card">
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <button className="btn btn-gold btn-sm" onClick={handleFlip}>
                <RotateCw size={14} />
                <span>{isFlipped ? 'Show Front' : 'Flip Card'}</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleNext} title="Next card">
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Active Recall Mastery Rating */}
            <div className="mastery-rating-buttons">
              <button 
                className={`rating-btn btn-need-review ${!isCurrentMastered ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMastery(currentCard.id, false);
                }}
              >
                <AlertCircle size={15} />
                <span>Need Review</span>
              </button>
              <button 
                className={`rating-btn btn-mastered ${isCurrentMastered ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMastery(currentCard.id, true);
                }}
              >
                <CheckCircle size={15} />
                <span>Mark Mastered</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
