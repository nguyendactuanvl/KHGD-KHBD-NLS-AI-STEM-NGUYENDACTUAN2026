const fs = require('fs');
let content = fs.readFileSync('src/pages/Worksheets.tsx', 'utf8');

const targetImport = `import { saveToHistory } from '../lib/history';`;
const replacementImport = `import { saveToHistory, getHistory } from '../lib/history';
import { HistoryItem } from '../types';`;

const targetState = `  const [suggestion, setSuggestion] = useState("");
  const [isEditing, setIsEditing] = useState(false);`;
const replacementState = `  const [suggestion, setSuggestion] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  
  useEffect(() => {
    setHistoryItems(getHistory().filter(item => item.type === 'PHT'));
  }, []);`;

content = content.replace(targetImport, replacementImport);
content = content.replace(targetState, replacementState);

const targetSave = `      // Save to history
      saveToHistory({
        type: "PHT",
        grade: selectedGrade,
        subject: subject,
        lessonName: customLessonName,
        content: data.result
      });`;
const replacementSave = `      // Save to history
      saveToHistory({
        type: "PHT",
        grade: selectedGrade,
        subject: subject,
        lessonName: customLessonName,
        content: data.result
      });
      setHistoryItems(getHistory().filter(item => item.type === 'PHT'));`;

content = content.replace(targetSave, replacementSave);

const targetDropdown = `          <p className="text-sm text-slate-500 mt-1">
            Tạo phiếu bài tập, tóm tắt kiến thức cho học sinh
          </p>
        </div>`;
const replacementDropdown = `          <p className="text-sm text-slate-500 mt-1">
            Tạo phiếu bài tập, tóm tắt kiến thức cho học sinh
          </p>
        </div>

        {historyItems.length > 0 && (
          <div className="p-4 border-b border-slate-200 bg-white">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lịch sử đã tạo
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              onChange={(e) => {
                if (e.target.value) {
                  const item = historyItems.find(h => h.id === e.target.value);
                  if (item) {
                    setSuggestion(item.content);
                    setCustomLessonName(item.lessonName);
                    if (item.subject) setSubject(item.subject);
                    if (item.grade) setSelectedGrade(item.grade);
                  }
                }
              }}
            >
              <option value="">-- Chọn phiếu học tập đã tạo --</option>
              {historyItems.map(item => (
                <option key={item.id} value={item.id}>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')} - {item.lessonName}
                </option>
              ))}
            </select>
          </div>
        )}`;

content = content.replace(targetDropdown, replacementDropdown);

const targetImportReact = `import { useState, useRef } from "react";`;
const replacementImportReact = `import { useState, useRef, useEffect } from "react";`;
content = content.replace(targetImportReact, replacementImportReact);

fs.writeFileSync('src/pages/Worksheets.tsx', content);
