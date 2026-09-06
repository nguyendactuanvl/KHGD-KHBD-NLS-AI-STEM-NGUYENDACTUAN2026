/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { EducationalPlan } from "./pages/EducationalPlan";
import { LessonPlan } from "./pages/LessonPlan";
import { Circulars } from "./pages/Circulars";
import { HistoryPage } from "./pages/HistoryPage";
import { Worksheets } from "./pages/Worksheets";
import { SettingsModal } from "./components/SettingsModal";
import { ExerciseSolver } from './pages/ExerciseSolver';
import { PdfToWord } from './pages/PdfToWord';

export default function App() {
  const [activeTab, setActiveTab] = useState("khgd");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("user_gemini_api_key");
    if (!storedKey) {
      setIsSettingsOpen(true);
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <main className="flex-1 overflow-y-auto">
        {activeTab === "khgd" && <EducationalPlan />}
        {activeTab === "khdh" && <LessonPlan />}
        {activeTab === "worksheets" && <Worksheets />}
        {activeTab === "exercise" && <ExerciseSolver />}
        {activeTab === "pdf2word" && <PdfToWord />}
        {activeTab === "circulars" && <Circulars />}
        {activeTab === "history" && <HistoryPage />}
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
