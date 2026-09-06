import { useState, useRef } from "react";
import { Sparkles, Save, BookOpen, Download, AlertCircle, Edit3, Eye } from "lucide-react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { saveToHistory } from '../lib/history';
import { cn } from "../lib/utils";

export function Worksheets() {
  const [selectedGrade, setSelectedGrade] = useState<number>(10);
  const [customLessonName, setCustomLessonName] = useState("");
  const [subject, setSubject] = useState("Toán");
  const [worksheetType, setWorksheetType] = useState("Kết hợp trắc nghiệm và tự luận");
  
  const [suggestion, setSuggestion] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const exportRef = useRef<HTMLDivElement>(null);

  const subjects = ["Toán", "Vật lý", "Hóa học", "Sinh học", "Ngữ văn", "Tiếng Anh", "Lịch sử", "Địa lý", "Giáo dục Kinh tế và Pháp luật", "Tin học", "Công nghệ"];
  const worksheetTypes = [
    "Kết hợp trắc nghiệm và tự luận",
    "Chỉ trắc nghiệm khách quan",
    "Chỉ tự luận",
    "Bài tập thực hành / Dự án nhỏ"
  ];

  const handleGenerate = async () => {
    if (!customLessonName) {
      setError("Vui lòng nhập tên bài học hoặc chủ đề.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuggestion("");
    
    try {
      const response = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-api-key': encodeURIComponent(localStorage.getItem("user_gemini_api_key") || "")
        },
        body: JSON.stringify({
          lesson: customLessonName,
          subject: subject,
          grade: selectedGrade,
          type: worksheetType
        })
      });

      if (!response.ok) {
        let errorMsg = "Lỗi khi kết nối với AI (API trả về lỗi).";
        try {
          const text = await response.text();
          try {
             const errorData = JSON.parse(text);
             errorMsg = errorData.error || errorMsg;
          } catch(e) {
             if (response.status === 503 || response.status === 504 || response.status === 502) {
                errorMsg = "Hệ thống đang quá tải hoặc hết thời gian chờ. Vui lòng thử lại sau.";
             } else {
                errorMsg = `Lỗi hệ thống (${response.status}): Không thể kết nối với máy chủ.`;
             }
          }
        } catch (e) {
          // ignore
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setSuggestion(data.result);
      
      // Save to history
      saveToHistory({
        type: "PHT",
        grade: selectedGrade,
        subject: subject,
        lessonName: customLessonName,
        content: data.result
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể tạo phiếu học tập lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportWord = () => {
    if (!suggestion || !exportRef.current) {
      if (isEditing) {
        alert("Vui lòng chuyển sang chế độ 'Xem trước' (con mắt) trước khi tải xuống.");
      }
      return;
    }

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Export HTML To Doc</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; }
          h1 { font-size: 18pt; text-align: center; margin-bottom: 20px; }
          h2 { font-size: 16pt; margin-top: 20px; }
          h3 { font-size: 14pt; margin-top: 15px; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid black; padding: 8px; }
          .katex-mathml { display: none; } /* Hide MathML from Word export */
          .katex { font-family: 'Cambria Math', serif; } /* Attempt fallback for math in Word */
        </style>
      </head>
      <body>
        ${exportRef.current.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PhieuHocTap_${customLessonName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Settings */}
      <div className="w-[400px] border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Phiếu học tập
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tạo phiếu bài tập, tóm tắt kiến thức cho học sinh
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Môn học
              </label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Khối lớp
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {[10, 11, 12].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium rounded-md transition-colors",
                      selectedGrade === grade
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Lớp {grade}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bài học / Chủ đề
              </label>
              <input
                type="text"
                placeholder="Nhập tên bài hoặc chủ đề..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={customLessonName}
                onChange={(e) => setCustomLessonName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hình thức bài tập
              </label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={worksheetType}
                onChange={(e) => setWorksheetType(e.target.value)}
              >
                {worksheetTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !customLessonName}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Tạo phiếu học tập</span>
              </>
            )}
          </button>
          {error && (
            <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Content - Preview */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 h-[73px]">
          <h2 className="text-lg font-bold text-slate-800">
            Kết quả hiển thị
          </h2>
          <div className="flex gap-2">
            {suggestion && (
              <>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
                      !isEditing ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Eye className="w-4 h-4" /> Xem trước
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
                      isEditing ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Edit3 className="w-4 h-4" /> Chỉnh sửa
                  </button>
                </div>
                <button
                  onClick={handleExportWord}
                  className={cn(
                    "px-4 py-2 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm transition-colors",
                    isEditing ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  title={isEditing ? "Chuyển sang chế độ xem trước để tải xuống" : ""}
                >
                  <Download className="w-4 h-4" /> Xuất Word
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-emerald-700 font-medium">Đang tạo nội dung...</p>
              <p className="text-slate-500 text-sm max-w-sm text-center">
                AI đang xử lý yêu cầu. Thời gian có thể mất khoảng 10-30 giây tùy thuộc vào độ phức tạp của bài học.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {suggestion ? (
                isEditing ? (
                  <textarea
                    className="w-full h-[70vh] min-h-[500px] p-6 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none font-mono text-sm bg-white"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                  />
                ) : (
                  <div className="bg-white p-8 md:p-12 shadow-sm border border-slate-200 rounded-xl min-h-[500px]">
                    <div ref={exportRef} className="markdown-body prose prose-slate max-w-none prose-headings:text-slate-800 prose-h2:text-2xl prose-h2:border-b prose-h2:pb-2 prose-h3:text-xl prose-a:text-emerald-600 prose-table:border-collapse prose-th:border prose-th:bg-slate-50 prose-td:border prose-td:p-2">
                      <Markdown 
                        remarkPlugins={[remarkMath, remarkGfm]} 
                        rehypePlugins={[rehypeRaw, rehypeKatex]}
                      >
                        {suggestion}
                      </Markdown>
                    </div>
                  </div>
                )
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-300">
                  <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Kết quả sẽ hiển thị ở đây</p>
                  <p className="text-sm mt-2 text-slate-500">Điền thông tin và nhấn "Tạo phiếu học tập" để bắt đầu</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
