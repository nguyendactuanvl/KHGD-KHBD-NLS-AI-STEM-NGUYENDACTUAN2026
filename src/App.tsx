/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { EducationalPlan } from "./pages/EducationalPlan";
import { LessonPlan } from "./pages/LessonPlan";
import { Circulars } from "./pages/Circulars";

export default function App() {
  const [activeTab, setActiveTab] = useState("khgd");

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {activeTab === "khgd" && <EducationalPlan />}
        {activeTab === "khdh" && <LessonPlan />}
        {activeTab === "circulars" && <Circulars />}
      </main>
    </div>
  );
}
