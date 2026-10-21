"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  deleteConversation,
  deleteDocument,
  getSettings,
  listDocuments,
  type DocumentListItem,
} from "../api/client";
import { STRINGS, type Language, type Strings } from "../i18n";
import PdfUpload from "./PdfUpload";
import Sidebar from "./Sidebar";
import ToastHost from "./Toast";

interface AppContextValue {
  t: Strings;
  language: Language;
  setLanguage: (language: Language) => void;
  documents: DocumentListItem[];
  patchDocument: (documentId: string, patch: Partial<DocumentListItem>) => void;
  isApiKeyConfigured: boolean;
  setIsApiKeyConfigured: (isConfigured: boolean) => void;
  openUpload: () => void;
  openBook: (documentId: string) => void;
  deleteDocument: (documentId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside <AppShell>");
  return value;
}

function viewFor(pathname: string): "library" | "settings" | "chat" {
  if (pathname.startsWith("/books/")) return "chat";
  if (pathname.startsWith("/preferences")) return "settings";
  return "library";
}

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ documentId?: string }>();
  const selectedDocumentId = params.documentId ?? null;

  const [language, setLanguage] = useState<Language>("en");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);

  const t = STRINGS[language];

  const refreshDocuments = useCallback(() => {
    listDocuments().then(setDocuments);
  }, []);

  useEffect(() => {
    getSettings().then((s) => setIsApiKeyConfigured(s.is_openai_key_configured));
    refreshDocuments();
  }, [refreshDocuments]);

  const patchDocument = useCallback((documentId: string, patch: Partial<DocumentListItem>) => {
    setDocuments((prev) => prev.map((d) => (d.id === documentId ? { ...d, ...patch } : d)));
  }, []);

  const openBook = useCallback((documentId: string) => router.push(`/books/${documentId}`), [router]);

  function handleUploaded(documentId: string) {
    setShowUpload(false);
    refreshDocuments();
    openBook(documentId);
  }

  async function handleDeleteConversation(documentId: string, conversationId: string) {
    await deleteConversation(conversationId);
    if (selectedDocumentId === documentId) router.push("/library");
    refreshDocuments();
  }

  const handleDeleteDocument = useCallback(
    async (documentId: string) => {
      await deleteDocument(documentId);
      if (selectedDocumentId === documentId) router.push("/library");
      refreshDocuments();
    },
    [selectedDocumentId, router, refreshDocuments],
  );

  const contextValue = useMemo<AppContextValue>(
    () => ({
      t,
      language,
      setLanguage,
      documents,
      patchDocument,
      isApiKeyConfigured,
      setIsApiKeyConfigured,
      openUpload: () => setShowUpload(true),
      openBook,
      deleteDocument: handleDeleteDocument,
    }),
    [t, language, documents, patchDocument, isApiKeyConfigured, openBook, handleDeleteDocument],
  );

  return (
    <AppContext.Provider value={contextValue}>
      <div style={{ height: "100vh", display: "flex", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
        <Sidebar
          t={t}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          view={viewFor(pathname)}
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          onNewBook={() => setShowUpload(true)}
          onShowLibrary={() => router.push("/library")}
          onShowSettings={() => router.push("/preferences")}
          onOpenBook={openBook}
          onDeleteConversation={handleDeleteConversation}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>{children}</div>

        {showUpload && (
          <PdfUpload t={t} onClose={() => setShowUpload(false)} onUploaded={handleUploaded} isApiKeyConfigured={isApiKeyConfigured} />
        )}
      </div>
      <ToastHost />
    </AppContext.Provider>
  );
}
