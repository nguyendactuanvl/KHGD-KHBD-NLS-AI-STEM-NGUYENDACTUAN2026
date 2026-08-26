import { useState, useMemo, useRef } from "react";
import { Sparkles, Save, BookOpen, Download, AlertCircle, Upload, Edit3, Eye } from "lucide-react";
import { fullPlan } from "../data/mockData";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export function LessonPlan() {
  const [activeTab, setActiveTab] = useState<"system" | "upload">("system");
  const [selectedGrade, setSelectedGrade] = useState<number>(10);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  
  const [customLessonName, setCustomLessonName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ data: string, type: string, name: string } | null>(null);
  
  const [suggestion, setSuggestion] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Filter lessons by selected grade
  const availableLessons = useMemo(() => {
    return fullPlan.filter(plan => plan.grade === selectedGrade);
  }, [selectedGrade]);

  // Find the fully selected lesson object
  const selectedLesson = useMemo(() => {
    if (!selectedLessonId) return null;
    return availableLessons.find(p => p.id === selectedLessonId) || null;
  }, [selectedLessonId, availableLessons]);

  // Set the first lesson as default when changing grades
  useMemo(() => {
    if (availableLessons.length > 0 && (!selectedLessonId || !availableLessons.find(l => l.id === selectedLessonId))) {
      setSelectedLessonId(availableLessons[0].id);
    }
  }, [availableLessons]);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileType = file.type || '';
    const validTypes = ['application/pdf', 'text/plain', 'text/csv', 'text/html'];
    
    if (!validTypes.includes(fileType) && !file.name.match(/\.(pdf|txt|csv|html)$/i)) {
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
  };

  const generateLessonPlan = async () => {
    if (activeTab === "system" && !selectedLesson) return;
    if (activeTab === "upload" && (!uploadedFile || !customLessonName.trim())) {
      setError("Vui lòng nhập tên bài học và tải lên file Kế hoạch giáo dục.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuggestion("");
    
    try {
      let endpoint = '/api/generate-lesson-plan';
      let payload: any = {};
      
      if (activeTab === "system") {
        payload = {
          lesson: selectedLesson!.lesson,
          requirement: selectedLesson!.requirement,
          digitalComp: selectedLesson!.digitalComp,
          aiComp: selectedLesson!.aiComp,
          stem: selectedLesson!.stem,
          grade: selectedLesson!.grade
        };
      } else {
        endpoint = '/api/generate-lesson-plan-file';
        payload = {
          lesson: customLessonName,
          fileData: uploadedFile!.data,
          fileMimeType: uploadedFile!.type
        };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = "Lỗi khi kết nối với AI (API trả về lỗi).";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          if (response.status === 504 || response.status === 502) {
            errorMsg = "Hệ thống đang quá tải hoặc hết thời gian chờ. Vui lòng thử lại sau.";
          } else {
            errorMsg = `Lỗi hệ thống (${response.status}): Không thể kết nối với máy chủ.`;
          }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setSuggestion(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể soạn giáo án lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportWord = () => {
    if (!suggestion || !exportRef.current) {
      if (isEditing) {
        alert("Vui lòng tắt chế độ chỉnh sửa (ấn biểu tượng Con mắt) để lưu tệp Word có định dạng đầy đủ.");
      }
      return;
    }
    
    // Clone to manipulate the DOM for Word compatibility
    const clone = exportRef.current.cloneNode(true) as HTMLElement;
    
    // Extract MathML from KaTeX for native Word Equation support
    const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
      const mathml = el.querySelector('.katex-mathml');
      if (mathml) {
        el.parentNode?.replaceChild(mathml.cloneNode(true), el);
      }
    });

    const contentHtml = clone.innerHTML;
    
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns:m='http://schemas.microsoft.com/office/2004/12/omml' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Giáo án</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; }
        table { border-collapse: collapse; width: 100%; margin: 15pt 0; }
        th, td { border: 1px solid black; padding: 6pt; text-align: left; vertical-align: top; }
        th { background-color: #f3f4f6; font-weight: bold; }
        img { max-width: 100%; height: auto; display: block; margin: 15pt auto; text-align: center; }
        h1, h2, h3, h4, h5, h6 { color: #1e293b; margin-top: 15pt; margin-bottom: 5pt; }
        h2 { font-size: 16pt; }
        h3 { font-size: 14pt; }
        p, li { font-size: 13pt; line-height: 1.5; margin-bottom: 8pt; }
        a { color: #059669; text-decoration: none; }
      </style>
    </head><body>`;
    const footer = "</body></html>";
    
    const html = header + contentHtml + footer;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    let downloadName = 'Giao_an.doc';
    if (activeTab === "system") {
      downloadName = `Giao_an_${selectedLesson?.lesson ? selectedLesson.lesson.substring(0,30) : 'bai_hoc'}.doc`;
    } else {
      downloadName = `Giao_an_${customLessonName ? customLessonName.substring(0,30) : 'bai_hoc'}.doc`;
    }
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-8 flex gap-8">
      <div className="w-1/3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm self-start flex flex-col gap-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          Soạn Kế hoạch Bài dạy
        </h2>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'system' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('system')}
          >
            Từ hệ thống
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'upload' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('upload')}
          >
            Từ tệp tải lên
          </button>
        </div>

        {activeTab === 'system' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cấp học</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
              >
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Bài học từ Kế hoạch</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
              >
                {availableLessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>
                    Bài {lesson.stt}: {lesson.lesson.length > 50 ? lesson.lesson.substring(0, 50) + '...' : lesson.lesson}
                  </option>
                ))}
              </select>
            </div>

            {selectedLesson && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm space-y-3">
                <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Thông tin bài học:</h3>
                <p><span className="font-medium text-slate-700">Tên bài:</span> {selectedLesson.lesson}</p>
                <p><span className="font-medium text-slate-700">Số tiết:</span> {selectedLesson.periods}</p>
                <p><span className="font-medium text-slate-700">Yêu cầu cần đạt:</span> <span className="text-slate-600">{selectedLesson.requirement}</span></p>
                
                <div className="pt-2">
                  <span className="font-medium text-blue-700 block mb-1">Năng lực số:</span> 
                  <span className="text-slate-600">{selectedLesson.digitalComp || "Không có"}</span>
                </div>
                
                <div>
                  <span className="font-medium text-purple-700 block mb-1">Năng lực AI:</span> 
                  <span className="text-slate-600">{selectedLesson.aiComp || "Không có"}</span>
                </div>
                
                <div>
                  <span className="font-medium text-emerald-700 block mb-1">Tích hợp STEM/STEAM:</span> 
                  <span className="text-slate-600">{selectedLesson.stem || "Không có"}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên bài học cần soạn</label>
              <input 
                type="text" 
                placeholder="VD: Bài 1: Mệnh đề..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                value={customLessonName}
                onChange={(e) => setCustomLessonName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tải lên tệp Kế hoạch giáo dục</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">
                  {uploadedFile ? uploadedFile.name : "Nhấn để tải lên tệp (PDF, TXT, CSV)"}
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.csv"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Hệ thống AI sẽ tự động đọc tệp để tìm kiếm các yêu cầu cần đạt, năng lực số, năng lực AI và STEM của bài học bạn yêu cầu. Vui lòng xuất Kế hoạch giáo dục từ Word/Excel sang định dạng PDF trước khi tải lên.
              </p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button 
          onClick={generateLessonPlan}
          disabled={isLoading || (activeTab === "system" ? !selectedLesson : false)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-sm"
        >
          <Sparkles className="h-5 w-5" />
          {isLoading ? "AI đang soạn bài..." : "Soạn Giáo án chuẩn công văn 5512"}
        </button>
      </div>

      <div className="flex-1 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative flex flex-col h-[calc(100vh-4rem)]">
        <div className="absolute top-4 right-4 flex gap-2 z-10 bg-white shadow-sm border border-slate-100 rounded-lg p-1">
          {suggestion && (
            <button 
              className={`p-2 rounded-md transition-colors ${isEditing ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
              title={isEditing ? "Xem trước" : "Chỉnh sửa"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Eye className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
            </button>
          )}
          <button 
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Lưu trữ"
          >
            <Save className="h-5 w-5" />
          </button>
          <button 
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            title="Tải xuống Word"
            onClick={handleExportWord}
            disabled={!suggestion}
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar mt-8">
          {suggestion ? (
            isEditing ? (
              <textarea
                className="w-full h-full min-h-[500px] p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none font-mono text-sm"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
              />
            ) : (
              <div ref={exportRef} className="markdown-body prose prose-slate max-w-none pb-12 pt-4 prose-headings:text-slate-800 prose-h2:text-2xl prose-h2:border-b prose-h2:pb-2 prose-h3:text-xl prose-a:text-emerald-600 prose-table:border-collapse prose-th:border prose-th:bg-slate-50 prose-td:border prose-td:p-2">
                <Markdown 
                  remarkPlugins={[remarkMath, remarkGfm]} 
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                >
                  {suggestion}
                </Markdown>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                  <p className="text-emerald-600 font-medium">Hệ thống AI đang đọc Kế hoạch giáo dục và soạn bài...</p>
                  <p className="text-sm mt-2 text-slate-400">Quá trình này có thể mất 15-20 giây.</p>
                </>
              ) : (
                <>
                  <Sparkles className="h-16 w-16 mb-4 text-slate-200" />
                  <p className="text-lg font-medium text-slate-500">Giáo án AI (Chuẩn CV 5512)</p>
                  <p className="mt-2 text-center max-w-md">Chọn bài học từ danh sách bên trái hoặc tải lên tệp Kế hoạch giáo dục của bạn và nhấn nút Soạn Giáo án để AI tự động tạo kế hoạch bài dạy bám sát các yêu cầu Năng lực số, AI và STEM.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
