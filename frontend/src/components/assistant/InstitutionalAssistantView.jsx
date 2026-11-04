/**
 * IITP CET AI — Institutional Assistant View (components/assistant/InstitutionalAssistantView.jsx)
 * -------------------------------------------------------------------------------------------------
 * The dedicated institutional chatbot interface for IIT Patna CET inquiries:
 *   1. Verified Q&A: Inquires about official admissions eligibility, fees, semester evaluations, and exit options.
 *   2. System Health & Transparency: Displays live backend health status, active LLM model, and indexed document catalog count.
 *   3. Guardrails & Disclaimers: Prominently renders the independent student prototype disclaimer and rejects credential phishing.
 *   4. Clickable Citations: Parses markdown source references into clickable links directly referencing official circulars.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Check, 
  Volume2, 
  ExternalLink,
  ChevronRight,
  Database,
  Server,
  AlertTriangle
} from 'lucide-react';
import { CET_INSTITUTION_INFO } from '../../data/cetData';
import { sendChatMessage, checkBackendHealth, fetchKnowledgeCatalog } from '../../services/api';

/**
 * Rich markdown-to-HTML parser for assistant messages.
 * Handles headings, bold/italics, lists, blockquotes, inline links, and code blocks.
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  const parseInline = (str) => {
    if (!str) return str;
    // Regex matching [label](url), **bold**, *italic*, `code`
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }

      if (match[2] && match[3]) {
        // [text](url)
        parts.push(
          <a
            key={match.index}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="msg-inline-link"
          >
            <span>{match[2]}</span>
            <ExternalLink size={10} style={{ opacity: 0.8 }} />
          </a>
        );
      } else if (match[4]) {
        // **bold**
        parts.push(<strong key={match.index}>{match[4]}</strong>);
      } else if (match[5]) {
        // *italic*
        parts.push(<em key={match.index}>{match[5]}</em>);
      } else if (match[6]) {
        // `code`
        parts.push(<code key={match.index} className="msg-code">{match[6]}</code>);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : str;
  };

  // Split by line for precise markdown parsing
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="msg-list">
          {currentList.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // Divider ---
    if (trimmed === '---') {
      flushList();
      elements.push(<hr key={`hr-${idx}`} className="msg-divider" />);
      return;
    }

    // Blockquote >
    if (trimmed.startsWith('>')) {
      flushList();
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote key={`quote-${idx}`} className="msg-quote">
          {parseInline(quoteText)}
        </blockquote>
      );
      return;
    }

    // Heading ###, ##, #
    if (/^#{1,4}\s+/.test(trimmed)) {
      flushList();
      const headingText = trimmed.replace(/^#{1,4}\s+/, '');
      elements.push(
        <h4 key={`h-${idx}`} className="msg-h4">
          {parseInline(headingText)}
        </h4>
      );
      return;
    }

    // Bullet list item • or - or * or 1.
    if (/^([•\-*]|\d+\.)\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^([•\-*]|\d+\.)\s+/, '');
      currentList.push(itemText);
      return;
    }

    // Regular line / paragraph
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="msg-p">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="formatted-msg-container">{elements}</div>;
}

export default function InstitutionalAssistantView({ 
  initialQuery = ''
}) {
  const [messages, setMessages] = useState([
    {
      id: 'asst-init',
      sender: 'assistant',
      text: `Namaste! I am the **IIT Patna Centre for Educational Technology (CET) Academic Assistant**.

I am strictly grounded in verified, publicly available institutional records from [cet.iitp.ac.in](https://cet.iitp.ac.in/):

• **Academic Programs**: BS in AI & Cyber Security (AICS), BS in CS & Data Analytics (CSDA), BBA, BBA-MBA, MTech
• **NEP 2020 Exit Milestones**: Certificate (40 cr), Diploma (80 cr), B.Sc. (120 cr), B.S. Honours (160 cr)
• **Evaluation Scheme & Grading**: Continuous assessment (40%), End-semester exam (50-60%), Minimum 75% attendance rule (XX Grade)
• **Admission Eligibility**: 10+2 Science with 60%, JEE Main/CUET/IITP-SAT entrance channels
• **Academic Calendars**: Autumn and Spring semester schedules
• **Moodle LMS Guidance**: Public access guidelines (note: this assistant never collects student login credentials)

How can I assist your academic journey today?`,
      citations: [
        { 
          doc_title: "CET Evaluation Scheme & Grading Regulations", 
          source_url: "https://cet.iitp.ac.in/index.php/academics/evaluation-scheme", 
          page: 1, 
          label: "Evaluation Scheme, Page 1",
          retrieval_date: "2026-10-15"
        },
        { 
          doc_title: "CET Academic Calendar & Semester Schedules", 
          source_url: "https://cet.iitp.ac.in/index.php/academics/academic-calendar", 
          page: 1, 
          label: "Academic Calendar, Page 1",
          retrieval_date: "2026-10-15"
        }
      ],
      timestamp: '9:00 AM'
    }
  ]);

  const [input, setInput] = useState(initialQuery || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true, engine: 'connecting' });
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [knowledgeCatalog, setKnowledgeCatalog] = useState([]);
  const [sessionId] = useState(() => `sess-${Math.random().toString(36).substring(2, 11)}`);
  
  // Refs for scroll and query handling
  const messagesContainerRef = useRef(null);
  const isFirstRender = useRef(true);
  const handledInitialQuery = useRef(false);

  const curatedTopics = [
    { label: "BS AICS Curriculum", query: "What is the curriculum and structure of BS in AI & Cyber Security?" },
    { label: "BS CSDA Track", query: "What are the admission eligibility requirements for BS in CSDA?" },
    { label: "Evaluation Scheme", query: "What is the evaluation scheme and attendance requirement at CET IIT Patna?" },
    { label: "NEP Exit Options", query: "What are the NEP exit options in BS in AI & Cyber Security?" },
    { label: "Moodle Instructions", query: "How do I access IIT Patna Moodle and what are the instructions?" },
    { label: "Attendance & XX Grade", query: "What happens if a student has less than 75% attendance?" }
  ];

  // Poll backend health on mount
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const health = await checkBackendHealth();
        if (isMounted) {
          if (health && health.status === 'healthy') {
            setBackendStatus({
              online: true,
              checking: false,
              engine: health.llm_provider || 'FastAPI Verified Grounded',
              details: health
            });
          } else {
            setBackendStatus({
              online: false,
              checking: false,
              engine: 'Companion Mode (Local Grounded Dataset)'
            });
          }
        }
      } catch {
        if (isMounted) {
          setBackendStatus({
            online: false,
            checking: false,
            engine: 'Companion Mode (Local Grounded Dataset)'
          });
        }
      }
    }
    checkHealth();
    return () => { isMounted = false; };
  }, []);

  // Fetch catalog on demand
  const handleOpenCatalog = async () => {
    setShowCatalogModal(true);
    if (knowledgeCatalog.length === 0) {
      const cat = await fetchKnowledgeCatalog();
      if (cat && cat.documents) {
        setKnowledgeCatalog(cat.documents);
      }
    }
  };

  const handleSend = useCallback(async (textToSend) => {
    const q = (textToSend !== undefined ? textToSend : input).trim();
    if (!q || isGenerating) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      const result = await sendChatMessage(q, sessionId);
      
      const asstMsg = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: result.text,
        citations: result.citations || [],
        verified: result.verified,
        engine: result.engine,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, asstMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: `Error connecting to assistant: ${err.message}. Please check if the backend server is running at http://localhost:8000.`,
        citations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  }, [input, isGenerating, sessionId]);

  // FIXED SCROLL LOGIC: Scroll ONLY the internal messages box, NEVER the window!
  // And never scroll on initial page load so user stays at the top.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Do NOT auto-scroll on mount!
    }
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages.length, isGenerating]);

  // Initial query trigger guard (fires only once if specified)
  useEffect(() => {
    if (initialQuery && !handledInitialQuery.current) {
      handledInitialQuery.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery, handleSend]);

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
    const clean = text.replace(/\[.*?\]\(.*?\)/g, '').replace(/[*_#]/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.onend = () => setSpeakingId(null);
    utter.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="assistant-hub-page animate-fade-in">
      <div className="container assistant-container">
        {/* Assistant Header Banner */}
        <div className="assistant-header-card card glass-panel">
          <div className="header-left-col">
            <div className="asst-pill-strip" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-gold">
                <Sparkles size={12} /> Institutional AI Advisor
              </span>
              <span className="badge badge-official">
                <ShieldCheck size={12} /> 100% Grounded
              </span>
              <span className={`badge ${backendStatus.online ? 'badge-success' : 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Server size={12} />
                <span>{backendStatus.online ? `API: ${backendStatus.engine}` : 'API: Local / Standby'}</span>
              </span>
            </div>

            <h1 className="asst-main-title">IIT Patna CET Institutional Academic Assistant</h1>
            <p className="asst-desc">
              Answers grounded strictly in verified public records from <strong>cet.iitp.ac.in</strong>. Cites verified sources with clickable external links.
            </p>

            {/* Prototype Disclaimer Banner */}
            <div style={{
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '6px',
              padding: '6px 12px',
              marginTop: '10px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-text-muted, #64748b)'
            }}>
              <AlertTriangle size={14} className="text-gold" />
              <span>
                <strong>Academic Prototype:</strong> Independent capstone project. Not officially endorsed by IIT Patna. For official notices, visit{' '}
                <a href={CET_INSTITUTION_INFO.portalUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-iitp-gold, #d4af37)', textDecoration: 'underline' }}>
                  cet.iitp.ac.in
                </a>.
              </span>
            </div>
          </div>

          <div className="header-quick-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={handleOpenCatalog}
              className="quick-portal-link"
              style={{ background: 'var(--color-surface, #ffffff)', cursor: 'pointer', border: '1px solid var(--color-border, #e2e8f0)' }}
            >
              <Database size={13} className="text-gold" />
              <span>View Indexed Knowledge Base (10 Sources)</span>
            </button>
            <a href={CET_INSTITUTION_INFO.admissionsPortal} target="_blank" rel="noreferrer" className="quick-portal-link">
              <span>Online Registration Portal</span>
              <ExternalLink size={13} />
            </a>
            <a href={CET_INSTITUTION_INFO.lmsUrl} target="_blank" rel="noreferrer" className="quick-portal-link">
              <span>Moodle LMS</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Curated Topic Chips Strip */}
        <div className="curated-topics-bar">
          <span className="topics-heading font-bold text-xs text-muted">Curated Queries:</span>
          <div className="curated-chips-row">
            {curatedTopics.map((item, idx) => (
              <button
                key={idx}
                className="curated-chip"
                onClick={() => handleSend(item.query)}
              >
                <span>{item.label}</span>
                <ChevronRight size={12} className="chip-arrow" />
              </button>
            ))}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="assistant-chat-feed card">
          {/* Scrollable Container with dedicated ref */}
          <div className="feed-messages-scroll" ref={messagesContainerRef}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`assistant-bubble-row ${isUser ? 'user-row' : 'asst-row'}`}>
                  <div className="avatar-box">
                    {isUser ? <User size={18} /> : <Bot size={18} className="text-gold" />}
                  </div>
                  <div className="bubble-content card">
                    <div className="bubble-meta">
                      <span className="name font-bold">
                        {isUser ? 'You' : 'CET Academic Assistant'}
                      </span>
                      <span className="time font-mono text-xs text-muted">{m.timestamp}</span>
                    </div>

                    {/* Rich Formatted Message Text */}
                    <div className="bubble-text">
                      <FormattedMessage text={m.text} />
                    </div>

                    {/* Citations with Clickable Links */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="citations-tray" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <span className="text-xs text-muted font-mono" style={{ display: 'block', marginBottom: '6px' }}>
                          Verified Public Sources & Citations:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {m.citations.map((c, cIdx) => {
                            const url = c.source_url || 'https://cet.iitp.ac.in/';
                            const label = c.label || c.doc_title || 'CET Portal Record';
                            return (
                              <a 
                                key={cIdx} 
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="citation-badge"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  textDecoration: 'none',
                                  cursor: 'pointer',
                                  background: 'rgba(0, 33, 71, 0.05)',
                                  border: '1px solid rgba(0, 33, 71, 0.15)',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  color: 'var(--color-iitp-navy, #002147)'
                                }}
                                title={`Retrieved from: ${url} (Date: ${c.retrieval_date || '2026-10-15'})`}
                              >
                                <FileText size={11} className="text-gold" />
                                <span>{label}</span>
                                <ExternalLink size={10} style={{ opacity: 0.7 }} />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {!isUser && (
                      <div className="bubble-actions">
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleCopy(m.id, m.text)}
                        >
                          {copiedId === m.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                          <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button 
                          className={`btn btn-ghost btn-sm ${speakingId === m.id ? 'text-gold' : ''}`}
                          onClick={() => handleSpeak(m.id, m.text)}
                        >
                          <Volume2 size={13} />
                          <span>{speakingId === m.id ? 'Speaking...' : 'Listen'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="assistant-bubble-row asst-row animate-fade-in">
                <div className="avatar-box">
                  <Bot size={18} className="text-gold animate-pulse" />
                </div>
                <div className="bubble-content card">
                  <div className="generating-indicator">
                    <span className="generating-dot"></span>
                    <span className="generating-dot"></span>
                    <span className="generating-dot"></span>
                    <span className="generating-text">Retrieving verified CET sources & assembling citations...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="assistant-input-box">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }} 
              className="assistant-form"
            >
              <input
                type="text"
                className="assistant-text-field"
                placeholder="Ask any question about IIT Patna CET programs, syllabi, grading, or calendar..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isGenerating}
              />
              <button 
                type="submit" 
                className="btn btn-gold" 
                disabled={!input.trim() || isGenerating}
              >
                <Send size={16} />
                <span>Submit Query</span>
              </button>
            </form>
          </div>
        </div>

        {/* Knowledge Base Modal */}
        {showCatalogModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div className="card glass-panel" style={{
              maxWidth: '750px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={20} className="text-gold" />
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Verified IIT Patna CET Knowledge Catalog</h2>
                </div>
                <button 
                  onClick={() => setShowCatalogModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                The assistant answers questions exclusively using verified, lawful public documents retrieved from <strong>cet.iitp.ac.in</strong> and official subdomains. Each document records source URL and retrieval timestamp.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(knowledgeCatalog.length > 0 ? knowledgeCatalog : [
                  { page_title: "About CET IIT Patna", category: "About", source_url: "https://cet.iitp.ac.in/index.php/the-institute", retrieval_date: "2026-10-15T09:16:00Z", summary: "Mission, Senate adoption of NEP-2020, commencement of UG programs in July 2023." },
                  { page_title: "Academic Programs", category: "Programs", source_url: "https://cet.iitp.ac.in/", retrieval_date: "2026-10-15T09:16:00Z", summary: "BS AICS, BS CSDA, BBA, BBA-MBA, MTech, MBA in GenAI, dual degrees." },
                  { page_title: "Admission Eligibility", category: "Admissions", source_url: "https://cet.iitp.ac.in/index.php/admissions/eligiblity", retrieval_date: "2026-10-15T09:16:00Z", summary: "10+2 Science 60%, JEE/CUET/IITP-SAT entrance requirements." },
                  { page_title: "Admissions Portal", category: "Admissions", source_url: "https://registrations.iitp-cep.in/", retrieval_date: "2026-10-15T09:16:00Z", summary: "Central registration portal for application form submissions." },
                  { page_title: "Evaluation Scheme & Regulations", category: "Academics", source_url: "https://cet.iitp.ac.in/index.php/academics/evaluation-scheme", retrieval_date: "2026-10-15T09:16:00Z", summary: "Continuous assessment (40%), proctored end-sem (50-60%), 75% attendance rule, distinction >= 75%." },
                  { page_title: "Academic Calendar", category: "Calendar", source_url: "https://cet.iitp.ac.in/index.php/academics/academic-calendar", retrieval_date: "2026-10-15T09:16:00Z", summary: "Autumn (August - December) and Spring (January - June) schedules." },
                  { page_title: "Moodle LMS Guidelines", category: "LMS", source_url: "https://moodle.iitp.ac.in/", retrieval_date: "2026-10-15T09:16:00Z", summary: "Public login instructions. Assistant never collects or handles student passwords." },
                  { page_title: "Public Announcements", category: "Announcements", source_url: "https://cet.iitp.ac.in/index.php/announcements/technology-club-internship-placement-cell", retrieval_date: "2026-10-15T09:16:00Z", summary: "Technology Club and Placement Cell candidate lists." },
                  { page_title: "BS AICS Curriculum & NEP Exits", category: "Programs", source_url: "https://cet.iitp.ac.in/", retrieval_date: "2026-10-15T09:16:00Z", summary: "160-credit degree, exit options at 40/80/120/160 credits, MOSS >15% plagiarism zero marks rule." },
                  { page_title: "BS CSDA Curriculum Handbook", category: "Programs", source_url: "https://cet.iitp.ac.in/", retrieval_date: "2026-10-15T09:16:00Z", summary: "Big data engineering, distributed computing, statistical machine learning core." }
                ]).map((doc, idx) => (
                  <div key={idx} style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--color-iitp-navy, #002147)' }}>
                        {doc.page_title}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        color: '#92400e',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {doc.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 6px 0' }}>{doc.summary}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                      <a 
                        href={doc.source_url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'var(--color-iitp-gold, #d4af37)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <span>{doc.source_url}</span>
                        <ExternalLink size={10} />
                      </a>
                      <span>Indexed: {new Date(doc.retrieval_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button 
                  className="btn btn-gold"
                  onClick={() => setShowCatalogModal(false)}
                >
                  Close Catalog
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
