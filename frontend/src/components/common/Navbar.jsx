import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  FolderGit2, 
  Layers, 
  Info, 
  Plus, 
  Menu, 
  X,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

export default function Navbar({ activeRoute, onNavigate, onOpenCreateModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'assistant', label: 'AI Study Assistant', icon: Sparkles, badge: 'Grounded' },
    { id: 'dashboard', label: 'My Notebooks', icon: FolderGit2 },
    { id: 'tools', label: 'Study Tools', icon: Layers },
    { id: 'about', label: 'About the Project', icon: Info },
  ];

  const handleLinkClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-wrapper">
      {/* Top Institute Notification Strip */}
      <div className="top-banner">
        <div className="container top-banner-content">
          <div className="top-banner-left">
            <span className="institute-seal">🏛️</span>
            <span>Indian Institute of Technology Patna • Centre for Educational Technology</span>
            <span className="top-banner-divider">|</span>
            <span className="nep-pill">NEP 2020 Compliant Programs</span>
          </div>
          <div className="top-banner-right">
            <a 
              href="https://cet.iitp.ac.in/" 
              target="_blank" 
              rel="noreferrer" 
              className="top-external-link"
            >
              <span>Live CET Portal</span>
              <ExternalLink size={12} />
            </a>
            <span className="top-banner-divider">•</span>
            <a 
              href="https://moodle.iitp.ac.in/" 
              target="_blank" 
              rel="noreferrer" 
              className="top-external-link"
            >
              <span>Moodle LMS</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="main-navbar" aria-label="Main Navigation">
        <div className="container main-navbar-container">
          {/* Brand Logo & Name */}
          <div 
            className="brand-logo-area" 
            onClick={() => handleLinkClick('home')}
            role="button"
            tabIndex={0}
            aria-label="CET AI Home"
          >
            <div className="brand-crest-box">
              <GraduationCap className="brand-crest-icon" size={26} />
              <div className="brand-crest-accent"></div>
            </div>
            <div className="brand-titles">
              <div className="brand-title-line">
                <span className="brand-acronym">CET</span>
                <span className="brand-highlight">AI</span>
                <span className="brand-tag-beta">CAPSTONE</span>
              </div>
              <span className="brand-subtitle">IIT Patna Academic Learning Assistant</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="desktop-nav-links">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={17} className="nav-icon" />
                  <span>{link.label}</span>
                  {link.badge && <span className="nav-badge-spark">{link.badge}</span>}
                </button>
              );
            })}
          </div>

          {/* Navbar Right Actions */}
          <div className="navbar-actions">
            <button 
              className="btn btn-gold btn-sm"
              onClick={onOpenCreateModal}
              title="Create a new study notebook"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="action-btn-text">New Notebook</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button 
              className="mobile-hamburger-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer animate-fade-in">
            <div className="mobile-drawer-links">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeRoute === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={19} />
                    <span className="mobile-nav-label">{link.label}</span>
                    {link.badge && <span className="nav-badge-spark">{link.badge}</span>}
                  </button>
                );
              })}
              <div className="mobile-drawer-footer">
                <button 
                  className="btn btn-gold btn-block" 
                  onClick={() => {
                    onOpenCreateModal();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Plus size={16} />
                  <span>Create New Notebook</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
