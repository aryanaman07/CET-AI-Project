/**
 * IITP CET AI — Document Chat & Study Copilot Panel (components/workspace/ChatPanel.jsx)
 * -------------------------------------------------------------------------------------
 * The center panel of the academic study workspace:
 *   1. Conversational Q&A: Student asks questions grounded in the attached PDF documents.
 *   2. Prompt Chips: Quick starter questions based on common academic inquiries.
 *   3. Verifiable Citations: Renders clickable citation badges indicating document name and page number.
 *   4. TTS Narration: Read-aloud capability for individual assistant responses via browser speech synthesis.
 *   5. Notes Export: Download chat conversation history as a markdown/text study note.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  RotateCcw, 
  Download, 
  Bot, 
  User, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { sendNotebookChatMessage } from '../../services/api';

export default function ChatPanel({ 
  notebook, 
  activeDocument, 
  onCitationClick, 
  onAddMessage,
  onClearHistory,
  initialQuery = '' 
}) {
  const [inputText, setInputText] = useState(initialQuery || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const messagesEndRef = useRef(null);

  const docName = activeDocument?.filename || activeDocument?.title || 'this document';
  const samplePrompts = activeDocument?.isInstitutional ? [
    "What are the core prerequisites and credits for this course?",
    "Explain the continuous evaluation breakdown and quiz weightage.",
    "Summarize the key theorems and formulas covered in this syllabus.",
    "What is the code plagiarism policy for lab submissions?"
  ] : [
    `Summarize the key concepts covered in ${docName}.`,
    "What are the main topics and definitions explained on Page 1?",
    "Generate 3 practice questions grounded strictly in this material.",
    "What are the core algorithms, formulas, or theorems in this document?"
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [notebook?.chatHistory, isGenerating]);

  // Handle external query pre-fill
  useEffect(() => {
    if (initialQuery) {
      setInputText(initialQuery);
    }
  }, [initialQuery]);

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id, text) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean citation brackets for cleaner speech
    const cleanSpeechText = text.replace(/\[.*?\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const generateGroundedResponse = (query) => {
    const docName = activeDocument?.filename || activeDocument?.title || "Uploaded Document";
    const docPages = activeDocument?.pages || [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    let bestMatch = null;
    let bestPage = 1;
    let maxHits = 0;

    for (const p of docPages) {
      const text = p.content || '';
      const sentences = text.split(/(?<=[.!?])\s+/);
      for (const s of sentences) {
        const sLower = s.toLowerCase();
        const hits = queryWords.filter(w => sLower.includes(w)).length;
        if (hits > maxHits) {
          maxHits = hits;
          bestMatch = s.trim();
          bestPage = p.pageNumber || 1;
        }
      }
    }

    if (bestMatch && maxHits > 0) {
      return {
        text: `Based on **${docName}** [${docName}, Page ${bestPage}]:\n\n> "${bestMatch}"\n\n*(Verified directly from page ${bestPage} of your uploaded document)*`,
        citations: [
          { docName, page: bestPage, label: `${docName}, Page ${bestPage}` }
        ]
      };
    }

    return {
      text: `The uploaded document **${docName}** does not appear to contain information answering:\n\n> "${query}"\n\nPlease ensure your question is covered in the text of this document.`,
      citations: []
    };
  };

  const handleSend = async (textToSend = inputText) => {
    const query = textToSend.trim();
    if (!query || isGenerating) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onAddMessage(userMsg);
    setInputText('');
    setIsGenerating(true);

    try {
      const notebookId = notebook?.id || 'nb-aics-dsa';
      const docId = activeDocument?.id || null;
      const history = (notebook?.chatHistory || []).slice(-6);
      const chatRes = await sendNotebookChatMessage(notebookId, query, null, history, docId);

      if (chatRes && chatRes.success) {
        const citations = (chatRes.citations || []).map(c => ({
          docName: c.doc_title,
          page: c.page || 1,
          label: c.label || `${c.doc_title}, Page ${c.page || 1}`,
          snippet: c.snippet
        }));

        const assistantMsg = {
          id: `msg-asst-${Date.now()}`,
          sender: 'assistant',
          text: chatRes.text,
          citations: citations,
          verified: chatRes.verified,
          engine: chatRes.engine,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        onAddMessage(assistantMsg);
      } else {
        // Graceful fallback
        const groundedResult = generateGroundedResponse(query);
        const assistantMsg = {
          id: `msg-asst-${Date.now()}`,
          sender: 'assistant',
          text: groundedResult.text,
          citations: groundedResult.citations,
          verified: true,
          engine: 'local-fallback',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        onAddMessage(assistantMsg);
      }
    } catch (err) {
      console.warn("Error calling notebook QA:", err);
      const groundedResult = generateGroundedResponse(query);
      const assistantMsg = {
        id: `msg-asst-${Date.now()}`,
        sender: 'assistant',
        text: groundedResult.text,
        citations: groundedResult.citations,
        verified: true,
        engine: 'offline-grounded-fallback',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onAddMessage(assistantMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportNotes = () => {
    const conversation = notebook?.chatHistory?.map(m => 
      `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n`
    ).join('\n---\n') || 'No chat history.';

    const blob = new Blob([`CET AI Study Session Notes - ${notebook?.title}\n\n${conversation}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notebook?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_Study_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to render citation badges within message text
  const renderMessageContent = (text, citations = []) => {
    // Look for patterns like [Doc, Page X]
    const parts = text.split(/(\[.*?\])/g);

    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const citationLabel = part.slice(1, -1);
        // Find matching citation object or parse page
        const match = citationLabel.match(/Page\s*(\d+)/i);
        const pageNum = match ? parseInt(match[1], 10) : 1;
        const matchingCitation = citations.find(c => c.label === citationLabel) || {
          docName: activeDocument?.filename || "Document.pdf",
          page: pageNum,
          label: citationLabel
        };

        return (
          <button
            key={index}
            className="citation-badge"
            onClick={() => onCitationClick(matchingCitation)}
            title={`Jump to ${citationLabel} in document viewer`}
          >
            <FileText size={11} />
            <span>{citationLabel}</span>
          </button>
        );
      }

      // Format bold markdown text (**text**)
      if (part.includes('**')) {
        const subParts = part.split(/(\*\*.*?\*\*)/g);
        return subParts.map((sub, sIdx) => {
          if (sub.startsWith('**') && sub.endsWith('**')) {
            return <strong key={sIdx}>{sub.slice(2, -2)}</strong>;
          }
          return sub;
        });
      }

      return part;
    });
  };

  return (
    <div className="chat-panel-container">
      {/* Chat Header */}
      <div className="chat-panel-header">
        <div className="chat-header-left">
          <div className="chat-asst-icon-box">
            <Bot size={20} className="text-gold" />
          </div>
          <div>
            <div className="chat-title-row">
              <h3 className="chat-title">AI Study Copilot</h3>
              <span className="badge badge-official">
                <ShieldCheck size={11} /> Strict RAG Grounding
              </span>
            </div>
            <p className="chat-active-doc font-mono text-xs text-muted">
              Attached: {activeDocument?.filename || 'Curriculum Specification'}
            </p>
          </div>
        </div>

        <div className="chat-header-actions">
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={handleExportNotes} 
            title="Export conversation as Markdown"
          >
            <Download size={15} />
            <span className="hide-on-mobile">Export</span>
          </button>
          <button 
            className="btn btn-ghost btn-sm text-muted" 
            onClick={onClearHistory} 
            title="Reset conversation"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-area">
        {(() => {
          const rawHistory = notebook?.chatHistory || [];
          const visibleMessages = (!activeDocument?.isInstitutional)
            ? rawHistory.filter(msg => {
                if (msg.citations && msg.citations.length > 0) {
                  const hasInst = msg.citations.some(c =>
                    (c.docName && /curriculum|aics|csda/i.test(c.docName)) ||
                    (c.label && /curriculum|aics|csda/i.test(c.label))
                  );
                  if (hasInst) return false;
                }
                if (msg.text && /plagiarism|NEP 2020|AICS|CSDA|continuous internal assessment/i.test(msg.text)) {
                  return false;
                }
                return true;
              })
            : rawHistory;

          if (visibleMessages.length === 0) {
            return (
              <div className="chat-empty-state">
                <div className="empty-sparkle-circle">
                  <Sparkles size={28} className="text-gold" />
                </div>
                <h4>Ask anything about this document</h4>
                <p>
                  I am grounded strictly in <strong>{activeDocument?.filename || activeDocument?.title || 'your uploaded document'}</strong>. Ask about concepts, definitions, formulas, or summaries.
                </p>
                <div className="empty-prompt-chips">
                  {samplePrompts.map((p, idx) => (
                    <button 
                      key={idx} 
                      className="empty-prompt-btn"
                      onClick={() => handleSend(p)}
                    >
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return visibleMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`chat-bubble-wrapper ${isUser ? 'user-message' : 'assistant-message'} animate-fade-in`}
              >
                <div className="message-avatar">
                  {isUser ? <User size={16} /> : <Bot size={16} className="text-gold" />}
                </div>

                <div className="message-content-box">
                  <div className="message-meta-row">
                    <span className="sender-name font-bold">
                      {isUser ? 'You (Scholar)' : 'CET AI Assistant'}
                    </span>
                    <span className="message-time font-mono">{msg.timestamp}</span>
                  </div>

                  <div className="message-body">
                    {renderMessageContent(msg.text, msg.citations)}
                  </div>

                  {/* Supporting Passages & Citations List */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="citations-tray-container" style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(15, 34, 64, 0.15)' }}>
                      <span className="text-xs font-bold text-navy" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <FileText size={12} className="text-gold" />
                        Verified Source Citations:
                      </span>
                      <div className="citations-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {msg.citations.map((c, cIdx) => (
                          <div 
                            key={cIdx} 
                            className="citation-card-pill"
                            onClick={() => onCitationClick(c)}
                            title={`Click to locate ${c.label || `${c.docName}, Page ${c.page}`} in document viewer`}
                            style={{
                              cursor: 'pointer',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              background: 'rgba(15, 34, 64, 0.04)',
                              border: '1px solid rgba(15, 34, 64, 0.12)',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: c.snippet ? '4px' : '0' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0F2240', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FileText size={11} className="text-navy" />
                                {c.label || `${c.docName}, Page ${c.page}`}
                              </span>
                              <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '1px 6px', cursor: 'pointer' }}>
                                Locate in PDF →
                              </span>
                            </div>
                            {c.snippet && (
                              <p style={{ margin: 0, fontSize: '0.78rem', color: '#4B5563', fontStyle: 'italic', borderLeft: '2px solid #D4AF37', paddingLeft: '6px', lineHeight: 1.35 }}>
                                "{c.snippet}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions for Assistant Messages */}
                  {!isUser && (
                    <div className="assistant-actions-row">
                      <button 
                        className="msg-action-btn"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button 
                        className={`msg-action-btn ${speakingId === msg.id ? 'text-gold' : ''}`}
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        title="Listen to audio speech"
                      >
                        <Volume2 size={13} />
                        <span>{speakingId === msg.id ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })()}

        {/* Generating Animation */}
        {isGenerating && (
          <div className="chat-bubble-wrapper assistant-message animate-fade-in">
            <div className="message-avatar">
              <Bot size={16} className="text-gold animate-pulse" />
            </div>
            <div className="message-content-box">
              <div className="generating-indicator">
                <span className="generating-dot"></span>
                <span className="generating-dot"></span>
                <span className="generating-dot"></span>
                <span className="generating-text">Retrieving vector chunks & formulating citation...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Suggested Chips */}
      <div className="chat-input-container">
        {/* Suggestion Chips */}
        <div className="quick-prompt-scroller">
          {samplePrompts.slice(0, 2).map((prompt, i) => (
            <button 
              key={i} 
              className="quick-chip-btn"
              onClick={() => handleSend(prompt)}
            >
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
          className="chat-input-form"
        >
          <input
            type="text"
            className="chat-text-input"
            placeholder={`Ask CET AI about ${activeDocument?.filename || 'this course'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isGenerating}
          />
          <button 
            type="submit" 
            className="btn btn-gold chat-send-btn"
            disabled={!inputText.trim() || isGenerating}
            aria-label="Send query"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
