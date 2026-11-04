import React from 'react';
import { GraduationCap, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { CET_INSTITUTION_INFO } from '../../data/cetData';

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-content">
        <div className="footer-grid">
          {/* Col 1: Institute Branding */}
          <div className="footer-col-brand">
            <div className="footer-brand-header">
              <div className="footer-crest-box">
                <GraduationCap size={22} className="footer-crest-icon" />
              </div>
              <div>
                <h3 className="footer-brand-title">CET AI Assistant</h3>
                <p className="footer-brand-sub">{CET_INSTITUTION_INFO.name}</p>
              </div>
            </div>
            <p className="footer-desc">
              An intelligent academic copilot and learning workspace, designed specifically for students and faculty of the Centre for Educational Technology at IIT Patna. Grounded strictly in official syllabi, ordinances, and academic schedules.
            </p>
            <div className="footer-compliance-pill">
              <ShieldCheck size={16} className="text-emerald" />
              <span>NEP 2020 Multi-Exit Curriculums Integrated</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform Navigation</h4>
            <ul className="footer-link-list">
              <li><button onClick={() => onNavigate('home')} className="footer-text-link">Home Portal</button></li>
              <li><button onClick={() => onNavigate('assistant')} className="footer-text-link">AI Study Assistant</button></li>
              <li><button onClick={() => onNavigate('dashboard')} className="footer-text-link">My Notebooks</button></li>
              <li><button onClick={() => onNavigate('tools')} className="footer-text-link">Active Recall Study Tools</button></li>
              <li><button onClick={() => onNavigate('about')} className="footer-text-link">About Capstone & Architecture</button></li>
            </ul>
          </div>

          {/* Col 3: Official Institute Links */}
          <div className="footer-col">
            <h4 className="footer-heading">IIT Patna Portals</h4>
            <ul className="footer-link-list">
              <li>
                <a href={CET_INSTITUTION_INFO.portalUrl} target="_blank" rel="noreferrer" className="footer-text-link external">
                  <span>CET Official Website</span>
                  <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <a href={CET_INSTITUTION_INFO.admissionsPortal} target="_blank" rel="noreferrer" className="footer-text-link external">
                  <span>Admission Registration</span>
                  <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <a href={CET_INSTITUTION_INFO.lmsUrl} target="_blank" rel="noreferrer" className="footer-text-link external">
                  <span>Moodle Learning Management</span>
                  <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <a href="https://www.iitp.ac.in/" target="_blank" rel="noreferrer" className="footer-text-link external">
                  <span>IIT Patna Main Website</span>
                  <ExternalLink size={13} />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Location & Notice */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact & Location</h4>
            <address className="footer-address">
              <strong>Indian Institute of Technology Patna</strong><br />
              Centre for Educational Technology (CET)<br />
              Bihta, Patna – 801106, Bihar, India<br />
              Email: <span className="font-mono text-gold">{CET_INSTITUTION_INFO.email}</span>
            </address>
            <div className="footer-prototype-alert">
              <Sparkles size={14} className="text-gold" />
              <span>Demonstration Prototype — Built for Capstone Evaluation. Not affiliated with live server infrastructure.</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © 2026 Centre for Educational Technology, IIT Patna. All rights reserved.
          </div>
          <div className="footer-badges">
            <span className="footer-tech-tag">React 19 + Vite</span>
            <span className="footer-tech-tag">RAG Architecture</span>
            <span className="footer-tech-tag">Edge-TTS Powered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
