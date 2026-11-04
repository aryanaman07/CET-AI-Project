/**
 * IITP CET AI — Audio Overview Component (components/workspace/AudioOverviewView.jsx)
 * -----------------------------------------------------------------------------------
 * Converts executive document summaries and study materials into natural spoken audio:
 *   1. Web Speech API (window.speechSynthesis): Uses native browser speech synthesis with zero server load.
 *   2. Controls: Play, Pause, Resume, Stop (cancel), and speed adjustments (1x, 1.25x, 1.5x).
 *   3. Sentence Boundary Tracking: Tracks speech progress dynamically using utterance.onboundary events.
 *   4. Lifecycle Management: Automatically halts audio narration when navigating away to prevent audio leaks.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Headphones, 
  Gauge,
  AlertCircle,
  Square
} from 'lucide-react';

export default function AudioOverviewView({ audioOverview, notebookTitle }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [errorMsg, setErrorMsg] = useState(null);
  const [charProgress, setCharProgress] = useState(0);

  const utteranceRef = useRef(null);
  const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (hasSpeechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [hasSpeechSynthesis]);

  if (!audioOverview || !audioOverview.script) {
    return (
      <div className="studio-empty-state">
        <Headphones size={36} className="text-muted" />
        <p>No audio overview synthesized for this notebook yet.</p>
        <span className="text-xs text-muted font-mono">
          Upload course materials and generate a summary to unlock audio synthesis.
        </span>
      </div>
    );
  }

  // Pre-clean dialogue script for natural speech delivery
  const cleanSpeechText = audioOverview.script
    .replace(/\[(?:Host|Guest|Speaker|Priya|Arjun)[^\]]*\]:?/gi, '')
    .replace(/[#*`_~]/g, '')
    .trim();

  const totalChars = cleanSpeechText.length || 1;

  const startSpeaking = (speed = playbackSpeed) => {
    if (!hasSpeechSynthesis) {
      setErrorMsg("Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      setErrorMsg(null);

      const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
      utterance.rate = speed;
      utterance.pitch = 1.0;

      // Select high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Samantha') || v.name.includes('Daniel')))
      ) || voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onboundary = (e) => {
        if (e.charIndex !== undefined) {
          setCharProgress(Math.min(100, Math.round((e.charIndex / totalChars) * 100)));
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCharProgress(100);
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn("Speech synthesis error:", e);
          setErrorMsg(`Playback issue: ${e.error || 'Speech failed'}`);
        }
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    } catch (err) {
      console.error("Speech synthesis invocation failed:", err);
      setErrorMsg("Failed to start speech synthesis engine.");
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleTogglePlay = () => {
    if (!hasSpeechSynthesis) {
      setErrorMsg("Speech synthesis is unavailable in your browser.");
      return;
    }

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      startSpeaking(playbackSpeed);
    }
  };

  const handleStop = () => {
    if (hasSpeechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCharProgress(0);
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);

    if (isPlaying && !isPaused) {
      startSpeaking(newSpeed);
    }
  };

  return (
    <div className="audio-overview-container animate-fade-in">
      {/* Audio Player Card */}
      <div className="audio-player-card card glass-dark">
        <div className="player-top-row">
          <div className="player-brand-badge">
            <span className={`dot-pulse ${isPlaying ? 'pulse-active' : ''}`}></span>
            <span>{isPlaying ? 'Synthesizing Spoken Audio...' : isPaused ? 'Audio Paused' : 'Spoken Audio Overview'}</span>
          </div>
          <span className="badge badge-navy font-mono">
            {hasSpeechSynthesis ? 'Browser Speech Engine' : 'Audio Unavailable'}
          </span>
        </div>

        <h3 className="player-title">{audioOverview.title || notebookTitle}</h3>
        <p className="player-speakers font-mono text-xs text-light">
          Speaker: {audioOverview.speaker || 'CET AI Academic Speaker'} • Spoken Dialogue Digest
        </p>

        {/* Error notification if speech engine encounters an issue */}
        {errorMsg && (
          <div className="audio-error-banner" style={{ background: '#7f1d1d', color: '#fecaca', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Real Progress Bar reflecting spoken character progress */}
        <div className="player-scrub-section">
          <div 
            className="player-progress-bar-bg" 
            style={{ 
              width: '100%', 
              height: '6px', 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: '3px',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            title={`Speech Progress: ${charProgress}%`}
          >
            <div 
              className="player-progress-bar-fill" 
              style={{ 
                width: `${charProgress}%`, 
                height: '100%', 
                background: 'var(--iitp-gold-400)',
                transition: 'width 0.2s ease'
              }}
            />
          </div>
          <div className="player-time-row font-mono text-xs" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>{charProgress}% spoken</span>
            <span>{isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Ready'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="player-controls-row">
          <button 
            type="button"
            className="speed-btn font-mono"
            onClick={handleSpeedChange}
            title="Change speech playback speed"
          >
            <Gauge size={13} className="inline-icon" />
            <span>{playbackSpeed}x</span>
          </button>

          <button 
            type="button"
            className="btn btn-gold player-play-btn"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Pause spoken audio' : 'Play spoken audio'}
            title={isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play spoken overview'}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>

          <button 
            type="button"
            className="btn btn-ghost btn-sm text-light"
            onClick={handleStop}
            title="Stop audio playback"
            aria-label="Stop audio"
          >
            <Square size={16} />
          </button>

          <button 
            type="button"
            className="btn btn-ghost btn-sm text-light"
            onClick={() => { handleStop(); startSpeaking(playbackSpeed); }}
            title="Restart from beginning"
            aria-label="Restart audio"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Spoken Transcript Card */}
      <div className="transcript-card card">
        <div className="card-badge-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Headphones size={16} className="text-navy" />
          <h4 className="card-subheading" style={{ margin: 0 }}>Spoken Dialogue Transcript</h4>
        </div>
        <div className="transcript-dialogue-list">
          {audioOverview.script?.split('\n\n').map((line, idx) => {
            const isHost = line.includes('[Host') || line.includes('[Priya') || line.includes('[Speaker');
            const [speaker, ...contentParts] = line.split(':');
            const content = contentParts.join(':');

            return (
              <div key={idx} className={`transcript-bubble ${isHost ? 'host-bubble' : 'guest-bubble'}`}>
                <div className="transcript-speaker font-bold text-xs">
                  {speaker?.replace(/\[|\]/g, '') || 'Speaker'}
                </div>
                <p className="transcript-text">{content || line}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
