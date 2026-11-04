/**
 * IITP CET AI — Browser Local Storage Service (services/storage.js)
 * -----------------------------------------------------------------
 * Manages client-side persistence in the browser's localStorage.
 *
 * Why Local Storage?
 *   - Provides instant client bootup before backend HTTP round-trips complete.
 *   - Preserves offline-crafted draft notes, active workspace selection, and UI preferences.
 *   - Acts as a local cache that is reconciled with SQLite backend data in App.jsx.
 */

import { INITIAL_NOTEBOOKS, PRELOADED_DOCUMENTS } from '../data/cetData';

const STORAGE_KEY_NOTEBOOKS = 'cet_ai_notebooks_v1';
const STORAGE_KEY_DOCS = 'cet_ai_documents_v1';
const STORAGE_KEY_ACTIVE_NB = 'cet_ai_active_notebook_v1';

export const isTestNotebook = (nb) => {
  if (!nb) return true;
  const id = String(nb.id || '').toLowerCase();
  const title = String(nb.title || '').toLowerCase();
  return (
    id.startsWith('test-') ||
    id.startsWith('other-nb-') ||
    id.startsWith('nb-empty-') ||
    title.startsWith('test ') ||
    title === 'empty notebook' ||
    title.startsWith('notebook test-') ||
    title.startsWith('notebook other-') ||
    title === 'other isolated notebook'
  );
};

export const StorageService = {
  getNotebooks: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTEBOOKS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(nb => !isTestNotebook(nb));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY_NOTEBOOKS, JSON.stringify(cleaned));
          }
          return cleaned.length > 0 ? cleaned : INITIAL_NOTEBOOKS;
        }
      }
    } catch (e) {
      console.warn("Storage access failed, using memory:", e);
    }
    // Default fallback
    return INITIAL_NOTEBOOKS;
  },

  saveNotebooks: (notebooks) => {
    try {
      const cleaned = Array.isArray(notebooks) ? notebooks.filter(nb => !isTestNotebook(nb)) : notebooks;
      localStorage.setItem(STORAGE_KEY_NOTEBOOKS, JSON.stringify(cleaned));
    } catch (e) {
      console.warn("Failed to save notebooks:", e);
    }
  },

  getDocuments: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DOCS);
      if (stored) {
        const customDocs = JSON.parse(stored);
        // Combine preloaded and custom
        return [...PRELOADED_DOCUMENTS, ...customDocs];
      }
    } catch (e) {
      console.warn("Storage access failed for docs:", e);
    }
    return PRELOADED_DOCUMENTS;
  },

  saveCustomDocument: (newDoc) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DOCS);
      const customDocs = stored ? JSON.parse(stored) : [];
      customDocs.unshift(newDoc);
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(customDocs));
      return [...PRELOADED_DOCUMENTS, ...customDocs];
    } catch (e) {
      console.warn("Failed to save custom doc:", e);
      return PRELOADED_DOCUMENTS;
    }
  },

  getActiveNotebookId: () => {
    try {
      return localStorage.getItem(STORAGE_KEY_ACTIVE_NB) || "nb-aics-dsa";
    } catch {
      return "nb-aics-dsa";
    }
  },

  setActiveNotebookId: (id) => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_NB, id);
    } catch (e) {
      console.warn("Failed to set active notebook id:", e);
    }
  },

  resetToDefaults: () => {
    try {
      localStorage.removeItem(STORAGE_KEY_NOTEBOOKS);
      localStorage.removeItem(STORAGE_KEY_DOCS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_NB);
    } catch (e) {
      console.warn("Failed to reset storage:", e);
    }
    return {
      notebooks: INITIAL_NOTEBOOKS,
      documents: PRELOADED_DOCUMENTS,
      activeNotebookId: "nb-aics-dsa"
    };
  }
};
