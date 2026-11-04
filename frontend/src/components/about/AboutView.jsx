import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Code2, 
  ExternalLink, 
  Sparkles, 
  FileCheck2,
  Users
} from 'lucide-react';
import { CET_INSTITUTION_INFO } from '../../data/cetData';

export default function AboutView() {
  const architecturalPrinciples = [
    {
      title: "Decoupled Companion Model",
      desc: "Operates independently alongside the live Joomla website (cet.iitp.ac.in). Zero risk of downtime, security breach, or administrative disruption to IIT Patna's production servers.",
      icon: ShieldCheck
    },
    {
      title: "Deterministic Source Grounding",
      desc: "Prevents hallucinations by enforcing strict retrieval-augmented generation (RAG). Every answer cites exact document names and page numbers (e.g. [AICS, Page 2]).",
      icon: FileCheck2
    },
    {
      title: "Team-Friendly Reproducibility",
      desc: "Designed for undergraduate/postgraduate student teams. Standard React (Vite) + Python FastAPI with SQLite requiring zero cloud subscriptions or complex Docker setups to run locally.",
      icon: Users
    },
    {
      title: "Cost-Effective & Free-Tier Friendly",
      desc: "Built to utilize Google Gemini Flash free tier (with OpenRouter and deterministic fallbacks) and in-browser speech synthesis for audio overviews with zero ongoing API expenses.",
      icon: Sparkles
    }
  ];

  const teamModules = [
    {
      num: "Module 1",
      name: "Frontend UI/UX & Interactive Study Workspace",
      tech: "React 19 • Vite • Vanilla CSS Tokens",
      status: "Completed & Active",
      deliverables: "Split-screen PDF reader canvas, 3D flashcards flip deck, diagnostic quiz generator, responsive theme, and real-time citation jumping."
    },
    {
      num: "Module 2",
      name: "Backend API & Document Ingestion Service",
      tech: "Python 3.11+ • FastAPI • SQLite • PyMuPDF",
      status: "Completed & Operational",
      deliverables: "FastAPI REST routers (/api/health, /api/notebooks, PDF upload), SQLite 6-table persistence, PyMuPDF page-by-page extraction, and file guardrails."
    },
    {
      num: "Module 3",
      name: "RAG Retrieval Engine & Citation Grounding",
      tech: "FAISS Vector Search • Dense Hash Embeddings • Gemini / OpenRouter API",
      status: "Completed & Operational",
      deliverables: "Per-notebook isolated FAISS indices, cosine similarity matching, dual-provider failover, and verifiable citation grounding."
    },
    {
      num: "Module 4",
      name: "CET AI Learning Studio & Audio Overview",
      tech: "Web Speech API • Pydantic • SQLite Artifacts",
      status: "Implemented & Active",
      deliverables: "Diagnostic MCQ scoring, spaced repetition active recall cards, structured study guides, and in-browser spoken audio overview synthesis."
    }
  ];

  return (
    <div className="about-page animate-fade-in">
      <div className="container about-container">
        {/* About Header */}
        <div className="about-header-card card glass-panel">
          <div className="about-header-seal">
            <GraduationCap size={36} className="text-gold" />
          </div>
          <div>
            <div className="about-pill-row">
              <span className="badge badge-gold">IIT Patna Capstone Project</span>
              <span className="badge badge-navy">Centre for Educational Technology</span>
            </div>
            <h1 className="about-title">CET AI — Academic Learning & Research Assistant</h1>
            <p className="about-subtitle">
              A standalone, verifiable academic study companion and research assistant, designed specifically for students, faculty, and prospective applicants of IIT Patna CET.
            </p>
          </div>
        </div>

        {/* Problem Statement vs Enhancement */}
        <div className="comparison-section card">
          <h2 className="section-title">Comparative Analysis: Live Portal vs. CET AI</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Existing CET Website (cet.iitp.ac.in)</th>
                  <th>CET AI Capstone Enhancement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold">Platform Engine</td>
                  <td>Joomla! 4/5 CMS with Astroid Framework & PHP</td>
                  <td>Modern React 19 (Vite) + Python FastAPI companion portal</td>
                </tr>
                <tr>
                  <td className="font-bold">User Interaction</td>
                  <td>One-way broadcast (menus, static tables, links)</td>
                  <td>Two-way interactive AI conversational workspace</td>
                </tr>
                <tr>
                  <td className="font-bold">Document Handling</td>
                  <td>Static PDF download links (CSDA.pdf, AICS.pdf)</td>
                  <td>In-browser PDF reader + contextual RAG extraction</td>
                </tr>
                <tr>
                  <td className="font-bold">Study Aids</td>
                  <td>None (redirects to external Moodle LMS)</td>
                  <td>Built-in Learning Studio (Summaries, Quizzes, Flashcards)</td>
                </tr>
                <tr>
                  <td className="font-bold">Accessibility</td>
                  <td>Visual text and downloadable PDFs only</td>
                  <td>Edge-TTS Audio Overview podcast synthesis</td>
                </tr>
                <tr>
                  <td className="font-bold">Branding & Identity</td>
                  <td>Official IIT Patna Navy & Gold, academic serif</td>
                  <td>Exact visual homage (Navy #002147 & Gold #d4af37)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Core Architectural Principles */}
        <div className="principles-section">
          <h2 className="section-title text-center">Core Architectural Principles</h2>
          <div className="principles-grid">
            {architecturalPrinciples.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="principle-card card">
                  <div className="principle-icon-box">
                    <Icon size={24} className="text-gold" />
                  </div>
                  <h3 className="principle-title">{item.title}</h3>
                  <p className="principle-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Work Breakdown Structure (WBS) */}
        <div className="wbs-section card">
          <div className="wbs-header">
            <Code2 size={24} className="text-navy" />
            <div>
              <h2 className="section-title mb-1">Work Breakdown Structure (WBS)</h2>
              <p className="text-muted text-sm">Standalone module boundaries for multi-member engineering teams.</p>
            </div>
          </div>

          <div className="wbs-grid">
            {teamModules.map((mod, idx) => (
              <div key={idx} className="wbs-card">
                <div className="wbs-card-top">
                  <span className="badge badge-navy font-mono">{mod.num}</span>
                  <span className="badge badge-official">{mod.status}</span>
                </div>
                <h3 className="wbs-title">{mod.name}</h3>
                <div className="wbs-tech font-mono text-xs text-muted mb-2">{mod.tech}</div>
                <p className="wbs-deliverables text-sm">{mod.deliverables}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Attribution & Disclaimer */}
        <div className="disclaimer-card card glass-dark">
          <div className="disclaimer-header">
            <ShieldCheck size={28} className="text-gold" />
            <h3 className="disclaimer-title">Academic Capstone Identity & Disclaimer</h3>
          </div>
          <p className="disclaimer-text">
            This application is an educational software capstone project designed to showcase the integration of Retrieval-Augmented Generation (RAG) and interactive study aids for the Centre for Educational Technology at the Indian Institute of Technology Patna.
          </p>
          <p className="disclaimer-text">
            All institutional data—including curriculum details for BS in AI & Cyber Security, BS in CS & Data Analytics, Evaluation Schemes, and Academic Calendars—are derived faithfully from publicly accessible documents on <a href={CET_INSTITUTION_INFO.portalUrl} target="_blank" rel="noreferrer" className="text-gold font-bold">cet.iitp.ac.in</a>. This software does not represent an administrative decision system or replace official Senate notifications.
          </p>
          <div className="disclaimer-links">
            <a href={CET_INSTITUTION_INFO.portalUrl} target="_blank" rel="noreferrer" className="btn btn-outline-gold btn-sm">
              <span>Visit Official IIT Patna CET Website</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
