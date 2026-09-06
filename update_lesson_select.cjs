const fs = require('fs');
let code = fs.readFileSync('src/pages/LessonPlan.tsx', 'utf8');

const subjects = [
  "Ngữ văn",
  "Toán",
  "Tiếng Anh",
  "Giáo dục thể chất",
  "Lịch sử",
  "Địa lí",
  "Giáo dục kinh tế và pháp luật",
  "Vật lí",
  "Hoá học",
  "Sinh học",
  "Công nghệ",
  "Tin học",
  "Âm nhạc",
  "Mĩ thuật",
  "Hoạt động trải nghiệm, hướng nghiệp",
  "Giáo dục quốc phòng và an ninh",
  "Chuyên đề học tập"
];

const subjectOptions = subjects.map(s => '<option value="' + s + '">' + s + '</option>').join('\\n                ');

const oldInputs = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
              <input 
                type="text" 
                placeholder="VD: Toán, Ngữ văn..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-4"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>`;

const newInputs = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-4 bg-white"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                ${subjectOptions}
              </select>
            </div>`;

code = code.replace(oldInputs, newInputs);
fs.writeFileSync('src/pages/LessonPlan.tsx', code);
