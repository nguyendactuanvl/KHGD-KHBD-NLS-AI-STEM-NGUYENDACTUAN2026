const fs = require('fs');
let content = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf8');

const targetImport = `import { saveToHistory } from '../lib/history';`;
const replacementImport = `import { saveToHistory, getHistory } from '../lib/history';
import { HistoryItem } from '../types';`;

const targetReactImport = `import React, { useState, useRef, useMemo } from 'react';`;
const replacementReactImport = `import React, { useState, useRef, useMemo, useEffect } from 'react';`;

const targetState = `  const [solution, setSolution] = useState<string>('');
  const [error, setError] = useState<string | null>(null);`;
const replacementState = `  const [solution, setSolution] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  
  useEffect(() => {
    setHistoryItems(getHistory().filter(item => item.type === 'GBT'));
  }, []);`;

content = content.replace(targetImport, replacementImport);
content = content.replace(targetReactImport, replacementReactImport);
content = content.replace(targetState, replacementState);

const targetSetSolution2 = `      const data = await response.json();
      setSolution(typeof data.result === 'string' ? data.result : (data.result?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data.result)));
    } catch (err: any) {`;
const replacementSetSolution2 = `      const data = await response.json();
      const newSolution = typeof data.result === 'string' ? data.result : (data.result?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data.result));
      setSolution(newSolution);
      saveToHistory({
        type: "GBT",
        grade: 0,
        subject: "Chung",
        lessonName: selectedFile ? "Giải bài tập: " + selectedFile.name : "Giải bài tập mới",
        content: newSolution
      });
      setHistoryItems(getHistory().filter(item => item.type === 'GBT'));
    } catch (err: any) {`;

content = content.replace(targetSetSolution2, replacementSetSolution2);

const targetDropdown = `          <p className="text-sm text-slate-500 mt-1">
            Tải ảnh hoặc tài liệu chứa bài tập, AI sẽ đưa ra lời giải chi tiết và tạo bài tập tương tự.
          </p>
        </div>`;
const replacementDropdown = `          <p className="text-sm text-slate-500 mt-1">
            Tải ảnh hoặc tài liệu chứa bài tập, AI sẽ đưa ra lời giải chi tiết và tạo bài tập tương tự.
          </p>
        </div>

        {historyItems.length > 0 && (
          <div className="p-4 border-b border-slate-200 bg-white">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lịch sử đã tạo
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              onChange={(e) => {
                if (e.target.value) {
                  const item = historyItems.find(h => h.id === e.target.value);
                  if (item) {
                    setSolution(item.content);
                  }
                }
              }}
            >
              <option value="">-- Chọn bài tập đã giải --</option>
              {historyItems.map(item => (
                <option key={item.id} value={item.id}>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')} - {item.lessonName}
                </option>
              ))}
            </select>
          </div>
        )}`;

content = content.replace(targetDropdown, replacementDropdown);

fs.writeFileSync('src/pages/ExerciseSolver.tsx', content);
