"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrCreateConversation, type ConversationOut } from "../../../api/client";
import { useApp } from "../../../components/AppShell";
import ChatArea from "../../../components/ChatArea";

export default function BookPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const router = useRouter();
  const { t, documents, patchDocument, isApiKeyConfigured } = useApp();
  const [conversation, setConversation] = useState<ConversationOut | null>(null);

  useEffect(() => {
    let cancelled = false;
    setConversation(null);
    getOrCreateConversation(documentId)
      .then((c) => {
        if (cancelled) return;
        setConversation(c);
        // Reflect the (possibly just-created) conversation locally so the sidebar shows
        // it immediately, rather than waiting for the next refreshDocuments() call.
        patchDocument(documentId, { conversation_id: c.id });
      })
      // A stale/invalid id in the URL (e.g. a deleted book) -- fall back to the library.
      .catch(() => {
        if (!cancelled) router.replace("/library");
      });
    return () => {
      cancelled = true;
    };
  }, [documentId, patchDocument, router]);

  const book = documents.find((d) => d.id === documentId);
  if (!book || !conversation) return null;

  function handleConversationUpdate(patch: Partial<ConversationOut>) {
    setConversation((prev) => (prev ? { ...prev, ...patch } : prev));
    if (patch.current_page !== undefined) {
      patchDocument(documentId, { current_page: patch.current_page ?? book?.current_page ?? null });
    }
  }

  return (
    <ChatArea
      t={t}
      documentId={book.id}
      documentTitle={book.title}
      totalPages={book.total_pages}
      conversation={conversation}
      onConversationUpdate={handleConversationUpdate}
      isApiKeyConfigured={isApiKeyConfigured}
    />
  );
}
