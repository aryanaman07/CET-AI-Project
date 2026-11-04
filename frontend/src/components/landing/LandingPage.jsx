import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileCheck2, 
  Layers, 
  Headphones, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  Search, 
  ChevronRight
} from 'lucide-react';
import { CET_PROGRAMS, STUDENT_PERSONAS } from '../../data/cetData';

export default function LandingPage({ onNavigate, onSelectQuickQuery }) {
  const [quickQueryInput, setQuickQueryInput] = useState('');

  const sampleQuestions = [
    "What are the NEP 2020 exit options in BS CSDA?",
    "What is the continuous assessment weightage in CET evaluation?",
    "When are the Autumn 2025 Mid-Semester examinations?",
    "What is the attendance threshold to avoid exam debarment?"
  ];

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (quickQueryInput.trim()) {
      onSelectQuickQuery(quickQueryInput.trim());
    }
  };

  return (
    <div className="landing-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-backdrop-glow"></div>
        <div className="container hero-container">
          {/* Top Pill */}
          <div className="hero-pill-badge">
            <span className="pill-dot"></span>
            <span className="pill-text">IIT Patna Centre for Educational Technology • Academic Capstone</span>
            <span className="pill-tag">NEP 2020</span>
          </div>

          <h1 className="hero-headline">
            AI-Powered Academic Learning & Research Assistant for <span className="hero-highlight">CET IIT Patna</span>
          </h1>

          <p className="hero-subtext">
            Transform heavy syllabus PDFs, lecture slides, and institutional regulations into an interactive 
            <strong> AI-powered academic study workspace</strong>. Chat with academic documents, verify exact page citations, 
            test yourself with diagnostic quizzes, and listen to synthesized audio overviews.
          </p>

          {/* Quick Grounded Question Bar */}
          <div className="hero-query-box card glass-dark">
            <div className="query-box-header">
              <Sparkles size={16} className="text-gold" />
              <span>Ask the Institutional Assistant (Grounded in Verified CET Documents)</span>
            </div>
            <form onSubmit={handleQuerySubmit} className="hero-search-form">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon text-muted" />
                <input
                  type="text"
                  className="hero-search-input"
                  placeholder="e.g., What are the admission criteria and exit options in BS in AI & Cyber Security?"
                  value={quickQueryInput}
                  onChange={(e) => setQuickQueryInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-gold btn-md">
                <span>Ask CET AI</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="sample-prompts-row">
              <span className="prompts-label">Try Asking:</span>
              <div className="prompts-chips">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="prompt-chip"
                    onClick={() => onSelectQuickQuery(q)}
                  >
                    <span>{q}</span>
                    <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="hero-cta-group">
            <button 
              className="btn btn-gold btn-lg shadow-gold"
              onClick={() => onNavigate('dashboard')}
            >
              <BookOpen size={20} />
              <span>Open Notebook Workspace</span>
            </button>
            <button 
              className="btn btn-secondary btn-lg"
              onClick={() => onNavigate('assistant')}
            >
              <Sparkles size={20} className="text-gold" />
              <span>Launch Institutional Assistant</span>
            </button>
            <button 
              className="btn btn-ghost btn-lg text-white"
              onClick={() => onNavigate('tools')}
            >
              <Layers size={20} />
              <span>Explore Study Tools</span>
            </button>
          </div>

          {/* Key Metric Strip */}
          <div className="hero-metrics-grid">
            <div className="metric-box">
              <span className="metric-num">100%</span>
              <span className="metric-label">Deterministic Page Citations</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-box">
              <span className="metric-num">6+</span>
              <span className="metric-label">CET Degree & Research Programs</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-box">
              <span className="metric-num">4</span>
              <span className="metric-label">Active Recall Study Studios</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-box">
              <span className="metric-num">0</span>
              <span className="metric-label">Live Server Intrusion Risk</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Matrix */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-gold">The Companion Solution</span>
            <h2 className="section-title">Solving the Passive Information Challenge</h2>
            <p className="section-sub">
              Rather than manually hunting through static web pages and multi-page PDFs on Joomla, CET AI provides a dynamic, two-way academic workspace.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card card card-interactive">
              <div className="feature-icon-box bg-navy-light">
                <FileCheck2 size={26} className="text-navy" />
              </div>
              <h3 className="feature-title">Split-Screen PDF Reader</h3>
              <p className="feature-desc">
                Inspect official curriculum documents and lecture notes side-by-side with an AI conversational assistant that references specific paragraph sections.
              </p>
              <div className="feature-tag-row">
                <span className="badge badge-navy">In-Browser PDF</span>
                <span className="badge badge-gold">Page Jumper</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card card card-interactive">
              <div className="feature-icon-box bg-gold-light">
                <ShieldCheck size={26} className="text-gold" />
              </div>
              <h3 className="feature-title">Verifiable Source Citations</h3>
              <p className="feature-desc">
                Every generated response includes clickable citation badges like <code className="font-mono text-gold">[AICS, Page 2]</code>. Click any badge to highlight that exact line in the document.
              </p>
              <div className="feature-tag-row">
                <span className="badge badge-official">Zero Hallucination</span>
                <span className="badge badge-navy">Strict RAG</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card card card-interactive">
              <div className="feature-icon-box bg-emerald-light">
                <Layers size={26} className="text-success" />
              </div>
              <h3 className="feature-title">Diagnostic Quiz Generator</h3>
              <p className="feature-desc">
                Turn any syllabus or lecture module into a timed 5-10 question multiple-choice quiz with immediate scoring and per-question rationale citing source sentences.
              </p>
              <div className="feature-tag-row">
                <span className="badge badge-navy">Active Recall</span>
                <span className="badge badge-official">Instant Grading</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="feature-card card card-interactive">
              <div className="feature-icon-box bg-purple-light">
                <Headphones size={26} className="text-purple" />
              </div>
              <h3 className="feature-title">AI Spoken Audio Overview</h3>
              <p className="feature-desc">
                Synthesizes a 3-minute conversational podcast dialogue of the course material using neural speech synthesis, allowing students to revise during their daily commute.
              </p>
              <div className="feature-tag-row">
                <span className="badge badge-gold">Neural Edge-TTS</span>
                <span className="badge badge-navy">Speed Scrubbing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Catalog Preview */}
      <section className="programs-section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-navy">Institutional Knowledge</span>
            <h2 className="section-title">Official IIT Patna CET Degree Programs</h2>
            <p className="section-sub">
              Pre-indexed curriculum handbooks, credit allocations, and flexible NEP 2020 exit milestones.
            </p>
          </div>

          <div className="programs-grid">
            {CET_PROGRAMS.map((prog) => (
              <div key={prog.id} className="program-card card">
                <div className="program-header">
                  <div className="prog-code-pill">{prog.code}</div>
                  <span className="prog-duration">{prog.duration}</span>
                </div>
                <h3 className="program-name">{prog.name}</h3>
                <p className="program-degree text-muted">{prog.degree}</p>

                <div className="program-focus-tags">
                  {prog.focusAreas.slice(0, 3).map((f, i) => (
                    <span key={i} className="focus-pill">{f}</span>
                  ))}
                </div>

                <div className="program-nep-box">
                  <div className="nep-label">
                    <GraduationCap size={14} className="text-gold" />
                    <span>NEP 2020 Exit Certifications:</span>
                  </div>
                  {prog.nepExitOptions.length > 0 ? (
                    <ul className="nep-exit-list">
                      {prog.nepExitOptions.map((opt) => (
                        <li key={opt.year}>
                          <strong>Year {opt.year} ({opt.credits} Cr):</strong> {opt.exitAward}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted text-sm">Standard Postgraduate Research Degree</p>
                  )}
                </div>

                <div className="program-footer">
                  <button 
                    className="btn btn-secondary btn-sm btn-block"
                    onClick={() => onSelectQuickQuery(`Explain the course modules and eligibility for ${prog.name}`)}
                  >
                    <span>Ask AI About This Program</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Personas Testimonials */}
      <section className="personas-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-gold">User Personas</span>
            <h2 className="section-title">Tailored for Scholars, Evaluators & Applicants</h2>
            <p className="section-sub">
              How different members of the IIT Patna academic community benefit from the CET AI assistant.
            </p>
          </div>

          <div className="personas-grid">
            {STUDENT_PERSONAS.map((person, idx) => (
              <div key={idx} className="persona-card card">
                <div className="persona-header">
                  <div className="persona-avatar">
                    <span>{person.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="persona-name">{person.name}</h4>
                    <p className="persona-role">{person.role}</p>
                  </div>
                  <span className="persona-badge">{person.badge}</span>
                </div>
                <blockquote className="persona-quote">
                  "{person.quote}"
                </blockquote>
                <div className="persona-program text-muted font-mono text-xs">
                  Target: {person.program}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capstone Transparency Callout */}
      <section className="callout-section">
        <div className="container">
          <div className="callout-card card glass-dark">
            <div className="callout-content">
              <div className="callout-seal">
                <GraduationCap size={40} className="text-gold" />
              </div>
              <div className="callout-text">
                <h3 className="callout-title">Academic Capstone Specification & Defense</h3>
                <p className="callout-desc">
                  CET AI is built as a decoupled companion service to demonstrate modern AI-driven educational technology 
                  for IIT Patna. It does not alter live databases or replace official Senate decision processes.
                </p>
                <div className="callout-actions">
                  <button 
                    className="btn btn-gold"
                    onClick={() => onNavigate('dashboard')}
                  >
                    <span>Explore My Notebooks</span>
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    className="btn btn-outline-gold"
                    onClick={() => onNavigate('about')}
                  >
                    <span>View Architecture Specification</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
