"use client";

import { useApp } from "../../components/AppShell";
import Library from "../../components/Library";

export default function LibraryPage() {
  const { t, documents, openBook, openUpload, deleteDocument } = useApp();
  return (
    <Library t={t} documents={documents} onOpenBook={openBook} onUploadClick={openUpload} onDeleteDocument={deleteDocument} />
  );
}
