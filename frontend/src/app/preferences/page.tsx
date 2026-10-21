"use client";

import { useApp } from "../../components/AppShell";
import SettingsView from "../../components/SettingsView";

export default function PreferencesPage() {
  const { t, language, setLanguage, setIsApiKeyConfigured } = useApp();
  return <SettingsView t={t} language={language} onLanguageChange={setLanguage} onApiKeyChange={setIsApiKeyConfigured} />;
}
