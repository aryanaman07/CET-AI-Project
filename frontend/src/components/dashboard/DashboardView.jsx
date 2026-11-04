/**
 * IITP CET AI — Scholar Dashboard View (components/dashboard/DashboardView.jsx)
 * -----------------------------------------------------------------------------
 * The primary workspace management screen for students:
 *   1. Summary Metrics: Displays active notebooks, indexed PDFs, and generated quiz questions.
 *   2. Quick Actions: Fast-entry cards to create a notebook, upload course PDFs, or open the chatbot.
 *   3. Filter & Search: Search by keywords or filter by academic program tags (BS-AICS, BS-CSDA, Regulations).
 *   4. Notebook Grid: Cards showing document counts, last modified dates, and direct links to workspaces.
 */

import React, { useState } from 'react';
import { 
  FolderPlus, 
  UploadCloud, 
  Sparkles, 
  Layers, 
  FileText, 
  Clock, 
  BookOpen, 
  Trash2, 
  Search, 
  ArrowUpRight,
  RotateCcw
} from 'lucide-react';

export default function DashboardView({ 
  notebooks = [], 
  onSelectNotebook, 
  onOpenCreateModal, 
  onOpenUploadModal, 
  onDeleteNotebook,
  onResetDefaults,
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');

  const tags = ['ALL', 'BS-AICS', 'BS-CSDA', 'Regulations', 'Custom'];

  const filteredNotebooks = notebooks.filter(nb => {
    const matchesSearch = nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nb.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nb.programTag?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'ALL' || nb.programTag === selectedTag || (selectedTag === 'Custom' && !['BS-AICS', 'BS-CSDA', 'Regulations'].includes(nb.programTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="container dashboard-container">
        {/* Welcome & Top Summary Bar */}
        <div className="dashboard-banner card glass-panel">
          <div className="banner-left">
            <div className="banner-badge">
              <span className="dot-pulse"></span>
              <span>IIT Patna CET Scholar Dashboard</span>
            </div>
            <h1 className="banner-title">My Academic Study Notebooks</h1>
            <p className="banner-sub">
              Manage your course materials, launch AI research sessions, test your mastery with diagnostic quizzes, and generate active recall flashcards.
            </p>
          </div>
          <div className="banner-stats-row">
            <div className="stat-pill">
              <span className="stat-val">{notebooks.length}</span>
              <span className="stat-name">Active Notebooks</span>
            </div>
            <div className="stat-pill">
              <span className="stat-val">{notebooks.reduce((acc, nb) => acc + (nb.documentCount || 1), 0)}</span>
              <span className="stat-name">Indexed PDFs</span>
            </div>
            <div className="stat-pill">
              <span className="stat-val">{notebooks.reduce((acc, nb) => acc + (nb.quizzes?.length || 0), 0)}</span>
              <span className="stat-name">Quiz MCQs</span>
            </div>
          </div>
        </div>

        {/* Quick Action Cards Grid (Requirement 3: Create, Upload, Quick Access) */}
        <div className="action-cards-grid">
          {/* Action 1: Create New Notebook */}
          <div 
            className="action-card card card-interactive action-card-create"
            onClick={onOpenCreateModal}
            role="button"
            tabIndex={0}
          >
            <div className="action-card-header">
              <div className="action-icon-box bg-gold-light">
                <FolderPlus size={24} className="text-gold" />
              </div>
              <span className="badge badge-gold">Primary Action</span>
            </div>
            <h3 className="action-card-title">Create New Notebook</h3>
            <p className="action-card-desc">
              Start a fresh study workspace for a syllabus module, exam, or research paper.
            </p>
            <div className="action-card-footer">
              <span className="footer-action-text font-bold text-navy">Launch Setup Modal</span>
              <ArrowUpRight size={16} className="text-navy" />
            </div>
          </div>

          {/* Action 2: Upload Study Material */}
          <div 
            className="action-card card card-interactive"
            onClick={onOpenUploadModal}
            role="button"
            tabIndex={0}
          >
            <div className="action-card-header">
              <div className="action-icon-box bg-navy-light">
                <UploadCloud size={24} className="text-navy" />
              </div>
              <span className="badge badge-navy">PDF / Handout</span>
            </div>
            <h3 className="action-card-title">Upload Study Material</h3>
            <p className="action-card-desc">
              Ingest a new course PDF (up to 15MB) or select from official CET syllabi.
            </p>
            <div className="action-card-footer">
              <span className="footer-action-text text-navy">Open Uploader</span>
              <ArrowUpRight size={16} className="text-navy" />
            </div>
          </div>

          {/* Action 3: Quick Access to AI Chat */}
          <div 
            className="action-card card card-interactive"
            onClick={() => onNavigate('assistant')}
            role="button"
            tabIndex={0}
          >
            <div className="action-card-header">
              <div className="action-icon-box bg-purple-light">
                <Sparkles size={24} className="text-purple" />
              </div>
              <span className="badge badge-official">Instant RAG</span>
            </div>
            <h3 className="action-card-title">Institutional AI Chat</h3>
            <p className="action-card-desc">
              Direct answers to questions regarding grading policies, admissions, and schedules.
            </p>
            <div className="action-card-footer">
              <span className="footer-action-text text-navy">Open Chatbot</span>
              <ArrowUpRight size={16} className="text-navy" />
            </div>
          </div>

          {/* Action 4: Quick Access to Quiz & Flashcards */}
          <div 
            className="action-card card card-interactive"
            onClick={() => onNavigate('tools')}
            role="button"
            tabIndex={0}
          >
            <div className="action-card-header">
              <div className="action-icon-box bg-emerald-light">
                <Layers size={24} className="text-success" />
              </div>
              <span className="badge badge-gold">Study Studio</span>
            </div>
            <h3 className="action-card-title">Quizzes & Flashcards</h3>
            <p className="action-card-desc">
              Quick access to diagnostic test generators, active recall cards, and audio summaries.
            </p>
            <div className="action-card-footer">
              <span className="footer-action-text text-navy">Open Study Tools</span>
              <ArrowUpRight size={16} className="text-navy" />
            </div>
          </div>
        </div>

        {/* Recent Notebooks Section */}
        <div className="recent-notebooks-section">
          <div className="section-toolbar">
            <div>
              <h2 className="section-heading">Recent Notebooks</h2>
              <p className="section-subtext">Click any notebook to open the split-screen study workspace.</p>
            </div>

            {/* Filter and Search */}
            <div className="toolbar-controls">
              <div className="search-bar-inline">
                <Search size={16} className="text-muted search-bar-icon" />
                <input
                  type="text"
                  placeholder="Filter notebooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-inline"
                />
              </div>

              <div className="tag-filter-group">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notebooks Grid */}
          {filteredNotebooks.length > 0 ? (
            <div className="notebooks-grid">
              {filteredNotebooks.map((nb) => (
                <div 
                  key={nb.id} 
                  className="notebook-card card card-interactive"
                  onClick={() => onSelectNotebook(nb.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectNotebook(nb.id);
                    }
                  }}
                  tabIndex={0}
                  role="article"
                  aria-label={`Notebook: ${nb.title}`}
                >
                  <div className="notebook-card-header">
                    <span className="badge badge-navy font-mono">{nb.programTag}</span>
                    <div className="notebook-header-right">
                      {nb.isSampleData ? (
                        <span className="badge badge-sample" title="Sample demonstration notebook">Demo Data</span>
                      ) : (
                        <span className="badge badge-official">User Notebook</span>
                      )}
                      <button
                        className="notebook-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete notebook "${nb.title}"?`)) {
                            onDeleteNotebook(nb.id);
                          }
                        }}
                        title="Delete notebook"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="notebook-card-title">{nb.title}</h3>
                  <p className="notebook-card-desc">{nb.description}</p>

                  <div className="notebook-material-badge">
                    <FileText size={14} className="text-navy" />
                    <span className="font-mono text-xs">{nb.documentTitle}</span>
                  </div>

                  <div className="notebook-stats-row">
                    <span className="stat-item">
                      <strong>{nb.quizzes?.length || 0}</strong> MCQs
                    </span>
                    <span className="stat-dot">•</span>
                    <span className="stat-item">
                      <strong>{nb.flashcards?.length || 0}</strong> Cards
                    </span>
                    <span className="stat-dot">•</span>
                    <span className="stat-item text-muted">
                      <Clock size={12} className="inline-icon" /> {nb.lastModified}
                    </span>
                  </div>

                  <div className="notebook-card-footer">
                    <button 
                      type="button"
                      className="btn btn-primary btn-sm btn-block"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNotebook(nb.id);
                      }}
                      aria-label={`Open study workspace for ${nb.title}`}
                    >
                      <BookOpen size={14} />
                      <span>Open Workspace</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="empty-state-card card">
              <FileText size={48} className="empty-state-icon text-muted" />
              <h3 className="empty-state-title">No matching notebooks found</h3>
              <p className="empty-state-desc">
                {searchQuery || selectedTag !== 'ALL' 
                  ? "Try resetting your search query or tag filter."
                  : "You haven't created any notebooks yet. Create your first notebook to begin!"}
              </p>
              <div className="empty-state-actions">
                <button className="btn btn-gold" onClick={onOpenCreateModal}>
                  <FolderPlus size={16} />
                  <span>Create New Notebook</span>
                </button>
                <button className="btn btn-secondary" onClick={onResetDefaults}>
                  <RotateCcw size={16} />
                  <span>Restore Sample Notebooks</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
