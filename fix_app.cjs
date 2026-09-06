const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStatement = `import { useState } from "react";`;
const newImportStatement = `import { useState, useEffect } from "react";`;

if (code.includes(importStatement) && !code.includes("useEffect")) {
  code = code.replace(importStatement, newImportStatement);
}

const oldState = `  const [activeTab, setActiveTab] = useState("khgd");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);`;

const newState = `  const [activeTab, setActiveTab] = useState("khgd");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("user_gemini_api_key");
    if (!storedKey) {
      setIsSettingsOpen(true);
    }
  }, []);`;

code = code.replace(oldState, newState);
fs.writeFileSync('src/App.tsx', code);
