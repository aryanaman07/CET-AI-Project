/**
 * IITP CET AI — Main React Application Root Component (App.jsx)
 * -------------------------------------------------------------
 * This component coordinates the overall application state and view rendering:
 *   1. Client-Side Routing: Resolves URL paths ('/', '/workspace/:id', '/assistant', '/dashboard', '/tools', '/about').
 *   2. State Management:
 *      - notebooks: List of student workspaces with metadata, document associations, and cached study tools.
 *      - documents: Uploaded and preloaded PDFs with extracted page texts.
 *      - activeNotebookId: ID of currently active workspace.
 *   3. Startup Hydration: Reconciles SQLite backend notebooks with localStorage cache on initial mount.
 *   4. Document Synchronization: Pulls backend-extracted pages and chunks when entering a workspace.
 *   5. Global Toast Notifications: Dispatches feedback alerts for uploads, deletions, and errors.
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import LandingPage from './components/landing/LandingPage';
import DashboardView from './components/dashboard/DashboardView';
import WorkspaceView from './components/workspace/WorkspaceView';
import InstitutionalAssistantView from './components/assistant/InstitutionalAssistantView';
import StudyToolsHubView from './components/tools/StudyToolsHubView';
import AboutView from './components/about/AboutView';
import CreateNotebookModal from './components/dashboard/CreateNotebookModal';
import UploadModal from './components/workspace/UploadModal';
import { StorageService, isTestNotebook } from './services/storage';
import { 
  deleteNotebookDocument, 
  createBackendNotebook, 
  updateBackendNotebookTitle, 
  deleteBackendNotebook,
  saveNotebookArtifact,
  fetchNotebookDocuments,
  fetchNotebookDocumentPages,
  fetchAllNotebooks
} from './services/api';
import './App.css';

export default function App() {
  const getInitialRouteState = () => {
    try {
      const path = window.location.pathname;
      if (path.startsWith('/workspace/')) {
        const parts = path.split('/');
        const nbId = parts[2];
        return { route: 'workspace', notebookId: nbId || null };
      }
      if (path === '/assistant') return { route: 'assistant', notebookId: null };
      if (path === '/notebooks' || path === '/dashboard') return { route: 'dashboard', notebookId: null };
      if (path === '/tools') return { route: 'tools', notebookId: null };
      if (path === '/about') return { route: 'about', notebookId: null };
    } catch {}
    return { route: 'home', notebookId: null };
  };

  const initialRouteInfo = getInitialRouteState();

  const [activeRoute, setActiveRoute] = useState(initialRouteInfo.route);
  const [notebooks, setNotebooks] = useState(() => StorageService.getNotebooks());
  const [documents, setDocuments] = useState(() => StorageService.getDocuments());
  const [activeNotebookId, setActiveNotebookId] = useState(() => 
    initialRouteInfo.notebookId || StorageService.getActiveNotebookId()
  );
  
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState('summary');
  const [assistantInitialQuery, setAssistantInitialQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (type, title, message) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync notebooks to storage
  const updateNotebooksAndSave = (updatedList) => {
    setNotebooks(updatedList);
    StorageService.saveNotebooks(updatedList);
  };

  const handleNavigate = (route, options = {}) => {
    setActiveRoute(route);
    if (options.initialTab) {
      setWorkspaceInitialTab(options.initialTab);
    }
    if (options.initialQuery) {
      setAssistantInitialQuery(options.initialQuery);
    }
    try {
      if (route === 'workspace' && activeNotebookId) {
        window.history.pushState(null, '', `/workspace/${activeNotebookId}`);
      } else if (route === 'home') {
        window.history.pushState(null, '', '/');
      } else {
        window.history.pushState(null, '', `/${route}`);
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize any backend-persisted uploaded documents for the notebook
  const syncBackendDocuments = async (notebookId) => {
    if (!notebookId) return;
    try {
      const backendDocs = await fetchNotebookDocuments(notebookId);
      if (backendDocs && backendDocs.length > 0) {
        const docPromises = backendDocs.map(async (bd) => {
          let pages = [];
          try {
            const rawPages = await fetchNotebookDocumentPages(notebookId, bd.id);
            if (rawPages && rawPages.length > 0) {
              pages = rawPages.map(p => ({
                pageNumber: p.page_number,
                title: p.title,
                content: p.content
              }));
            }
          } catch {}

          return {
            id: bd.id,
            notebookId: notebookId,
            title: bd.title,
            filename: bd.filename,
            category: 'Uploaded Study Material',
            isInstitutional: false,
            pageCount: bd.page_count,
            charCount: bd.char_count,
            fileSize: `${(bd.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`,
            isScanned: bd.is_scanned,
            pages: pages.length > 0 ? pages : [{
              pageNumber: 1,
              title: `${bd.filename} — Overview`,
              content: `Document: ${bd.filename}\nPages: ${bd.page_count}\nStatus: Ready for semantic search and Q&A.`
            }]
          };
        });

        const syncedDocs = await Promise.all(docPromises);
        if (syncedDocs.length > 0) {
          const latestDoc = syncedDocs[syncedDocs.length - 1];
          setDocuments(prev => {
            const ids = new Set(syncedDocs.map(d => d.id));
            const filtered = prev.filter(d => !ids.has(d.id));
            return [...syncedDocs, ...filtered];
          });

          setNotebooks(prev => {
            const updated = prev.map(nb => {
              if (nb.id === notebookId) {
                const targetDoc = syncedDocs.find(d => d.id === nb.documentId) || latestDoc;
                const wasSample = nb.isSampleData || !nb.documentId || (nb.documentId && nb.documentId.startsWith('doc-cs') || nb.documentId === 'doc-1');
                const docBaseName = targetDoc.title || targetDoc.filename.replace(/\.pdf$/i, "");
                return {
                  ...nb,
                  documentId: targetDoc.id,
                  documentTitle: targetDoc.filename,
                  title: wasSample ? `${docBaseName} — Study Workspace` : nb.title,
                  isSampleData: false,
                  // If transitioning from sample/demo data to custom PDF, clear old college tools
                  summary: wasSample ? null : nb.summary,
                  quizzes: wasSample ? null : nb.quizzes,
                  quizzesDocumentId: wasSample ? targetDoc.id : nb.quizzesDocumentId,
                  flashcards: wasSample ? null : nb.flashcards,
                  flashcardsDocumentId: wasSample ? targetDoc.id : nb.flashcardsDocumentId,
                  studyGuide: wasSample ? null : nb.studyGuide,
                  audioOverview: wasSample ? null : nb.audioOverview,
                  chatHistory: wasSample ? [
                    {
                      id: `msg-welcome-${Date.now()}`,
                      sender: 'assistant',
                      text: `Welcome! **${targetDoc.filename}** (${targetDoc.pageCount} pages) is now attached to your workspace. Ask any question about this document in the chat, or use the Study Studio on the right to generate AI summaries, quizzes, and flashcards grounded exclusively in this file.`,
                      timestamp: 'Just now',
                      citations: []
                    }
                  ] : nb.chatHistory,
                  documentCount: backendDocs.length
                };
              }
              return nb;
            });
            StorageService.saveNotebooks(updated);
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn("Could not sync documents from backend:", err);
    }
  };

  // Phase 3: Fetch existing notebooks from backend during application startup and reconcile
  useEffect(() => {
    let isMounted = true;

    async function hydrateNotebooksFromBackend() {
      try {
        const backendNotebooks = await fetchAllNotebooks();
        if (!isMounted || !Array.isArray(backendNotebooks) || backendNotebooks.length === 0) {
          return;
        }

        setNotebooks(prevLocal => {
          const localMap = new Map(prevLocal.map(n => [n.id, n]));
          const reconciled = [...prevLocal];

          for (const bNb of backendNotebooks) {
            if (localMap.has(bNb.id)) {
              const existing = localMap.get(bNb.id);
              const idx = reconciled.findIndex(n => n.id === bNb.id);
              if (idx !== -1) {
                reconciled[idx] = {
                  ...existing,
                  title: bNb.title || existing.title,
                  programTag: bNb.program_tag || existing.programTag,
                  documentCount: bNb.document_count !== undefined ? bNb.document_count : existing.documentCount
                };
              }
            } else {
              // Notebook was created on backend in another session/tab
              reconciled.unshift({
                id: bNb.id,
                title: bNb.title,
                programTag: bNb.program_tag || 'General',
                topic: bNb.description || 'Academic Notes',
                description: bNb.description || '',
                documentId: null,
                documentTitle: null,
                documentCount: bNb.document_count || 0,
                lastModified: bNb.updated_at ? 'Recently' : 'Just now',
                isSampleData: false,
                chatHistory: [],
                summary: null,
                quizzes: null,
                flashcards: null,
                studyGuide: null,
                audioOverview: null
              });
            }
          }

          StorageService.saveNotebooks(reconciled);
          return reconciled;
        });
      } catch (err) {
        console.warn("Could not hydrate notebooks from backend on startup:", err);
      }
    }

    hydrateNotebooksFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeNotebookId) {
      syncBackendDocuments(activeNotebookId);
    }
  }, [activeNotebookId]);

  const handleSelectNotebook = (id, tab = 'summary') => {
    setActiveNotebookId(id);
    StorageService.setActiveNotebookId(id);
    setWorkspaceInitialTab(tab);
    setActiveRoute('workspace');
    try {
      window.history.pushState(null, '', `/workspace/${id}`);
    } catch {}
    syncBackendDocuments(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNotebook = async (notebookDraft) => {
    try {
      const backendNb = await createBackendNotebook(
        notebookDraft.title,
        notebookDraft.description,
        notebookDraft.programTag
      );

      const authoritativeId = backendNb?.id || `nb-${Date.now()}`;
      const isBackendCreated = Boolean(backendNb?.id);

      const createdNotebook = {
        ...notebookDraft,
        id: authoritativeId,
        title: backendNb?.title || notebookDraft.title,
        programTag: backendNb?.program_tag || notebookDraft.programTag,
        isSampleData: !isBackendCreated,
        documentCount: 0
      };

      const updated = [createdNotebook, ...notebooks];
      updateNotebooksAndSave(updated);
      setActiveNotebookId(authoritativeId);
      StorageService.setActiveNotebookId(authoritativeId);
      setActiveRoute('workspace');
      try {
        window.history.pushState(null, '', `/workspace/${authoritativeId}`);
      } catch {}
      addToast('success', 'Notebook Created!', `"${createdNotebook.title}" has been launched in the workspace.`);
      return createdNotebook;
    } catch (err) {
      console.error("Failed to create notebook:", err);
      addToast('error', 'Creation Failed', err.message || 'Could not connect to backend server.');
      throw err;
    }
  };

  const handleDeleteNotebook = (id) => {
    deleteBackendNotebook(id);
    const target = notebooks.find(n => n.id === id);
    const updated = notebooks.filter(n => n.id !== id);
    updateNotebooksAndSave(updated);

    if (activeNotebookId === id && updated.length > 0) {
      setActiveNotebookId(updated[0].id);
      StorageService.setActiveNotebookId(updated[0].id);
    }
    addToast('info', 'Notebook Deleted', `"${target?.title || 'Notebook'}" was removed.`);
  };

  const handleResetDefaults = () => {
    const defaults = StorageService.resetToDefaults();
    setNotebooks(defaults.notebooks);
    setDocuments(defaults.documents);
    setActiveNotebookId(defaults.activeNotebookId);
    addToast('info', 'Defaults Restored', 'Official sample notebooks and curriculums have been reset.');
  };

  const handleUploadSuccess = (newDoc) => {
    const updatedDocs = StorageService.saveCustomDocument(newDoc);
    setDocuments(updatedDocs);

    // Attach to current active notebook
    const activeNb = notebooks.find(n => n.id === activeNotebookId);
    if (activeNb) {
      const updatedNotebooks = notebooks.map(nb => {
        if (nb.id === activeNotebookId) {
          const docBaseName = newDoc.title || newDoc.filename.replace(/\.pdf$/i, "");
          return {
            ...nb,
            documentId: newDoc.id,
            documentTitle: newDoc.filename,
            title: nb.isSampleData ? `${docBaseName} — Study Workspace` : nb.title,
            isSampleData: false,
            // Clear prior college materials so uploaded document has a clean slate
            summary: null,
            quizzes: null,
            quizzesDocumentId: newDoc.id,
            flashcards: null,
            flashcardsDocumentId: newDoc.id,
            studyGuide: null,
            audioOverview: null,
            chatHistory: [
              {
                id: `msg-welcome-${Date.now()}`,
                sender: 'assistant',
                text: `Welcome! **${newDoc.filename}** (${newDoc.pageCount} pages) is now attached to your workspace. Ask any question about this document in the chat, or use the Study Studio on the right to generate AI summaries, quizzes, and flashcards grounded exclusively in this file.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                citations: []
              }
            ],
            documentCount: (nb.documentCount || 1) + 1,
            lastModified: 'Just now'
          };
        }
        return nb;
      });
      updateNotebooksAndSave(updatedNotebooks);
    }

    addToast('success', 'Document Ingested!', `"${newDoc.filename}" (${newDoc.pageCount} pages) is now attached to your workspace.`);
  };

  const handleDeleteDocument = async (notebookId, documentId) => {
    try {
      await deleteNotebookDocument(notebookId, documentId);
    } catch (e) {
      console.warn("Backend document deletion note:", e);
    }
    const targetDoc = documents.find(d => d.id === documentId);
    const updatedDocs = documents.filter(d => d.id !== documentId);
    setDocuments(updatedDocs);

    const remainingForNb = updatedDocs.filter(d => d.notebookId === notebookId || d.isInstitutional);
    const fallbackDoc = remainingForNb[0] || updatedDocs[0];

    const updatedNotebooks = notebooks.map(nb => {
      if (nb.id === notebookId) {
        return {
          ...nb,
          documentId: nb.documentId === documentId ? fallbackDoc?.id : nb.documentId,
          documentTitle: nb.documentId === documentId ? fallbackDoc?.filename : nb.documentTitle,
          documentCount: Math.max(0, (nb.documentCount || 1) - 1)
        };
      }
      return nb;
    });
    updateNotebooksAndSave(updatedNotebooks);
    addToast('info', 'Document Removed', `"${targetDoc?.filename || 'Document'}" was removed and the vector index was rebuilt.`);
  };

  const handleUpdateNotebookTitle = (notebookId, newTitle) => {
    updateBackendNotebookTitle(notebookId, newTitle);
    const updated = notebooks.map(nb => {
      if (nb.id === notebookId) {
        return { ...nb, title: newTitle };
      }
      return nb;
    });
    updateNotebooksAndSave(updated);
    addToast('info', 'Title Updated', `Notebook renamed to "${newTitle}".`);
  };

  const handleSwitchDocument = (notebookId, docId) => {
    const selectedDoc = documents.find(d => d.id === docId);
    const updated = notebooks.map(nb => {
      if (nb.id === notebookId) {
        return { 
          ...nb, 
          documentId: docId, 
          documentTitle: selectedDoc?.filename || nb.documentTitle 
        };
      }
      return nb;
    });
    updateNotebooksAndSave(updated);
    addToast('info', 'Document Switched', `Active source changed to "${selectedDoc?.filename}".`);
  };

  const handleAddChatMessage = (notebookId, message) => {
    const updated = notebooks.map(nb => {
      if (nb.id === notebookId) {
        return {
          ...nb,
          chatHistory: [...(nb.chatHistory || []), message],
          lastModified: 'Just now'
        };
      }
      return nb;
    });
    updateNotebooksAndSave(updated);
  };

  const handleClearChatHistory = (notebookId) => {
    const updated = notebooks.map(nb => {
      if (nb.id === notebookId) {
        return {
          ...nb,
          chatHistory: []
        };
      }
      return nb;
    });
    updateNotebooksAndSave(updated);
    addToast('info', 'Chat Cleared', 'Conversation history has been reset for this notebook.');
  };

  const handleSelectQuickQuery = (query) => {
    setAssistantInitialQuery(query);
    setActiveRoute('assistant');
  };

  const handleUpdateNotebookStudyTool = (notebookId, toolType, toolData, options = {}) => {
    const updated = notebooks.map(nb => {
      if (nb.id === notebookId) {
        const updatedNb = {
          ...nb,
          [toolType]: toolData,
          lastModified: 'Just now'
        };
        if (options?.documentId) {
          if (toolType === 'quizzes') updatedNb.quizzesDocumentId = options.documentId;
          if (toolType === 'flashcards') updatedNb.flashcardsDocumentId = options.documentId;
        }
        if (toolType === 'quizzes' && Array.isArray(toolData)) {
          updatedNb.quizCount = toolData.length;
        } else if (toolType === 'flashcards' && Array.isArray(toolData)) {
          updatedNb.flashcardCount = toolData.length;
        } else if (toolType === 'summary') {
          updatedNb.summaryCount = 1;
        }
        return updatedNb;
      }
      return nb;
    });
    updateNotebooksAndSave(updated);

    // Save to backend SQLite persistence
    saveNotebookArtifact(notebookId, toolType, toolData);

    const toolLabels = {
      summary: 'Document Summary',
      quizzes: 'Diagnostic Quiz',
      flashcards: 'Revision Flashcards',
      studyGuide: 'Study Guide'
    };
    addToast('success', 'Study Tool Saved!', `${toolLabels[toolType] || toolType} has been saved to your notebook.`);
  };

  const currentNotebook = notebooks.find(n => n.id === activeNotebookId) || notebooks[0];

  return (
    <div className="app-root">
      {/* Universal Navbar */}
      <Navbar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content-wrapper">
        {activeRoute === 'home' && (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectQuickQuery={handleSelectQuickQuery}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}

        {activeRoute === 'dashboard' && (
          <DashboardView
            notebooks={notebooks}
            onSelectNotebook={handleSelectNotebook}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onDeleteNotebook={handleDeleteNotebook}
            onResetDefaults={handleResetDefaults}
            onNavigate={handleNavigate}
          />
        )}

        {activeRoute === 'workspace' && (
          <WorkspaceView
            notebook={currentNotebook}
            allDocuments={documents}
            onBackToDashboard={() => handleNavigate('dashboard')}
            onUpdateNotebookTitle={handleUpdateNotebookTitle}
            onSwitchDocument={handleSwitchDocument}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onDeleteDocument={handleDeleteDocument}
            onAddChatMessage={handleAddChatMessage}
            onClearChatHistory={handleClearChatHistory}
            onUpdateStudyTool={handleUpdateNotebookStudyTool}
            initialStudioTab={workspaceInitialTab}
          />
        )}

        {activeRoute === 'assistant' && (
          <InstitutionalAssistantView
            initialQuery={assistantInitialQuery}
            onOpenNotebook={handleSelectNotebook}
          />
        )}

        {activeRoute === 'tools' && (
          <StudyToolsHubView
            notebooks={notebooks}
            activeNotebookId={activeNotebookId}
            onSelectNotebook={setActiveNotebookId}
            onOpenWorkspace={handleSelectNotebook}
            onUpdateStudyTool={handleUpdateNotebookStudyTool}
          />
        )}

        {activeRoute === 'about' && (
          <AboutView />
        )}
      </main>

      {/* Universal Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals & Overlays */}
      <CreateNotebookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateNotebook}
        availableDocuments={documents}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        currentNotebookTitle={currentNotebook?.title}
        currentNotebookId={activeNotebookId}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
