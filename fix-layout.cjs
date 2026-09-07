const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// import Menu, Sparkles
if (!appContent.includes('Menu')) {
  appContent = appContent.replace('import { useState', 'import { Menu, Sparkles } from "lucide-react";\nimport { useState');
}

// add isSidebarOpen state
if (!appContent.includes('isSidebarOpen')) {
  appContent = appContent.replace('const [isSettingsOpen', 'const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n  const [isSettingsOpen');
}

// Replace return statement
const returnRegex = /return \([\s\S]*?\);\n}/;

const newReturn = `return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={\`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 \${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}\`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }} 
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            setIsSidebarOpen(false);
          }}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10 relative">
          <div className="flex items-center gap-2 text-emerald-600">
             <Sparkles className="h-6 w-6" />
             <span className="font-bold text-lg">EduPlan AI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto relative w-full h-full">
          {activeTab === "khgd" && <EducationalPlan />}
          {activeTab === "khdh" && <LessonPlan />}
          {activeTab === "worksheets" && <Worksheets />}
          {activeTab === "exercise" && <ExerciseSolver />}
          {activeTab === "pdf2word" && <PdfToWord />}
          {activeTab === "circulars" && <Circulars />}
          {activeTab === "history" && <HistoryPage />}
        </div>
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}`;

appContent = appContent.replace(returnRegex, newReturn);

fs.writeFileSync('src/App.tsx', appContent);
console.log('App.tsx updated');
