const fs = require('fs');
let code = fs.readFileSync('src/pages/EducationalPlan.tsx', 'utf8');

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

const oldInputs = `              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Môn học</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-32 px-3 py-1.5 border border-slate-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Lớp</label>
                <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-20 px-3 py-1.5 border border-slate-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Chủ đề</label>`;

const newInputs = `              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Môn học</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-48 px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white">
                ${subjectOptions}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Chủ đề</label>`;

code = code.replace(oldInputs, newInputs);
code = code.replace('const [grade, setGrade] = useState("10");', '');
code = code.replace('grade,', 'grade: "10, 11, 12",');

fs.writeFileSync('src/pages/EducationalPlan.tsx', code);
