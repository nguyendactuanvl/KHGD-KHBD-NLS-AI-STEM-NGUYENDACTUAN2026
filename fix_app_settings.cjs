const fs = require('fs');

// App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Replace automatic modal opening with an event listener
const oldUseEffect = `  useEffect(() => {
    const storedKey = localStorage.getItem("user_gemini_api_key");
    if (!storedKey) {
      setIsSettingsOpen(true);
    }
  }, []);`;

const newUseEffect = `  useEffect(() => {
    const handleShowModal = () => setIsSettingsOpen(true);
    window.addEventListener('show-api-key-modal', handleShowModal);
    return () => window.removeEventListener('show-api-key-modal', handleShowModal);
  }, []);`;

if (appContent.includes(oldUseEffect)) {
    appContent = appContent.replace(oldUseEffect, newUseEffect);
} else {
    // Just replace the string if it's different
    appContent = appContent.replace(/localStorage\.getItem\("user_gemini_api_key"\)/g, 'localStorage.getItem("eduplan_gemini_api_key_v2")');
}
fs.writeFileSync('src/App.tsx', appContent);

// SettingsModal.tsx
let settingsContent = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');
settingsContent = settingsContent.replace(/user_gemini_api_key/g, 'eduplan_gemini_api_key_v2');
fs.writeFileSync('src/components/SettingsModal.tsx', settingsContent);

