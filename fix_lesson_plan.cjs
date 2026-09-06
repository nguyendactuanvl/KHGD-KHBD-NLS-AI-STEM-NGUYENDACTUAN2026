const fs = require('fs');
let code = fs.readFileSync('src/pages/LessonPlan.tsx', 'utf8');

// Add states
code = code.replace(
  'const [customLessonName, setCustomLessonName] = useState("");',
  `const [customLessonName, setCustomLessonName] = useState("");
  const [subject, setSubject] = useState("Toán");
  const [uploadedFiles, setUploadedFiles] = useState<{data: string, type: string, name: string}[]>([]);`
);
code = code.replace(
  'const [uploadedFile, setUploadedFile] = useState<{ data: string, type: string, name: string } | null>(null);',
  ''
);

// Fix handleFileUpload
code = code.replace(
  `const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileType = file.type || '';
    const validTypes = ['application/pdf', 'text/plain', 'text/csv', 'text/html'];
    
    if (!validTypes.includes(fileType) && !file.name.match(/\\.(pdf|txt|csv|html)$/i)) {
      setError("AI hiện chỉ hỗ trợ đọc file định dạng PDF, TXT, CSV. Vui lòng xuất file Word/Excel sang định dạng PDF và tải lên lại.");
      setUploadedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result?.toString().split(',')[1];
      if (base64) {
        let mimeType = fileType;
        if (!mimeType) {
          if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
          else mimeType = 'text/plain';
        }
        setUploadedFile({
          data: base64,
          type: mimeType,
          name: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };`,
  `const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setError(null);
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const fileType = file.type || '';
        const validTypes = ['application/pdf', 'text/plain', 'text/csv', 'text/html'];
        
        let mimeType = fileType;
        if (!mimeType) {
          if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
          else mimeType = 'text/plain';
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result?.toString().split(',')[1];
          if (base64) {
            setUploadedFiles(prev => [...prev, {
              data: base64,
              type: mimeType,
              name: file.name
            }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };`
);

// Fix UI elements
code = code.replace(
  `<div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên bài học cần soạn</label>`,
  `<div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
              <input 
                type="text" 
                placeholder="VD: Toán, Ngữ văn..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-4"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên bài học cần soạn</label>`
);

code = code.replace(
  `<span className="text-sm font-medium">
                  {uploadedFile ? uploadedFile.name : "Nhấn để tải lên tệp (PDF, TXT, CSV)"}
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.csv"
                />`,
  `<span className="text-sm font-medium text-center">
                  Nhấn để tải lên tài liệu tham khảo (Sách, Văn bản...) <br/> ({uploadedFiles.length} tệp đã chọn)
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.csv,.html,.docx,.xlsx"
                  multiple
                />`
);

code = code.replace(
  `<p className="text-xs text-slate-500 mt-2">
                Hệ thống AI sẽ tự động đọc tệp để tìm kiếm các yêu cầu cần đạt, năng lực số, năng lực AI và STEM của bài học bạn yêu cầu. Vui lòng xuất Kế hoạch giáo dục từ Word/Excel sang định dạng PDF trước khi tải lên.
              </p>`,
  `<p className="text-xs text-slate-500 mt-2">
                Hệ thống AI sẽ tự động đọc tệp để tìm kiếm các yêu cầu cần đạt, năng lực số, năng lực AI và STEM của bài học bạn yêu cầu.
              </p>
              {uploadedFiles.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {uploadedFiles.map((f, i) => (
                    <span key={i} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full flex items-center gap-1">
                      {f.name}
                      <button onClick={(e) => { e.stopPropagation(); setUploadedFiles(prev => prev.filter((_, idx) => idx !== i)); }} className="text-red-500 font-bold ml-1 hover:text-red-700">×</button>
                    </span>
                  ))}
                </div>
              )}`
);

// Fix generation logic
code = code.replace(
  `if (activeTab === "upload" && (!uploadedFile || !customLessonName.trim())) {`,
  `if (activeTab === "upload" && (!customLessonName.trim())) {`
);

code = code.replace(
  `} else {
        endpoint = '/api/generate-lesson-plan-file';
        payload = {
          lesson: customLessonName,
          fileData: uploadedFile!.data,
          fileMimeType: uploadedFile!.type
        };
      }`,
  `} else {
        endpoint = '/api/generate-lesson-plan-file';
        payload = {
          lesson: customLessonName,
          subject: subject,
          files: uploadedFiles
        };
      }`
);

// For 'system' tab, we can also send subject if we want, but server endpoint expects it now?
code = code.replace(
  `payload = {
          lesson: selectedLesson!.lesson,
          requirement: selectedLesson!.requirement,
          digitalComp: selectedLesson!.digitalComp,
          aiComp: selectedLesson!.aiComp,          stem: selectedLesson!.stem,          grade: selectedLesson!.grade        };`,
  `payload = {
          lesson: selectedLesson!.lesson,          requirement: selectedLesson!.requirement,          digitalComp: selectedLesson!.digitalComp,          aiComp: selectedLesson!.aiComp,          stem: selectedLesson!.stem,          grade: selectedLesson!.grade,
          subject: subject || "Toán"
        };`
);

fs.writeFileSync('src/pages/LessonPlan.tsx', code);
