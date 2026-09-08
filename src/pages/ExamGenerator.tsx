
import { fullPlan } from "../data/mockData";
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useState, useRef } from "react";
import { FileCheck, Sparkles, Shuffle, Download, Share2, Plus, Trash2, Printer } from "lucide-react";

interface Question {
  type?: "mc" | "tf" | "sa" | "essay";
  explanation?: string;
  id: number;
  content: string;
  options: string[];
  correctOptionIndex?: number;
  correctAnswer?: string;
  level: string;
}

export function ExamGenerator() {
  const [activeTab, setActiveTab] = useState<"matrix" | "exam" | "shuffle">("matrix");
  const [subject, setSubject] = useState("Toán");
  const [grade, setGrade] = useState("9");
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [matrix, setMatrix] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  
  const [duration, setDuration] = useState(45);
  const [examType, setExamType] = useState("15p"); // 15p, mid, final
  const [qCounts, setQCounts] = useState({ mc: 20, tf: 0, sa: 0, essay: 0 });
  const [matrixFile, setMatrixFile] = useState<File | null>(null);
  const [matrixBase64, setMatrixBase64] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMatrixFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMatrixBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const availableTopics = subject.toLowerCase().includes("toán") ? fullPlan.filter(p => p.grade.toString() === grade).map(p => p.lesson) : [];

  const [examName, setExamName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [shuffledExams, setShuffledExams] = useState<{code: string, questions: Question[]}[]>([]);
  const [numCodes, setNumCodes] = useState(4);
  const [shareLink, setShareLink] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const apiKey = localStorage.getItem("user_gemini_api_key");
      if (!apiKey) throw new Error("Vui lòng cài đặt API Key trong phần Cài đặt.");

      
      const response = await fetch("/api/generate-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey
        },
        body: JSON.stringify({ 
          subject, grade, duration, examType, matrix, customPrompt,
          qCounts,
          matrixFile: matrixBase64,
          selectedTopics
        })
      });


      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Có lỗi xảy ra khi tạo đề.");
      }

      const data = await response.json();
      setExamName(data.examName || "Đề kiểm tra");
      setQuestions(data.questions || []);
      setActiveTab("exam");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShuffle = () => {
    if (questions.length === 0) return;
    const newExams = [];
    for (let i = 0; i < Math.min(numCodes, 24); i++) {
      const code = (101 + i).toString();
      const shuffledQ = [...questions].sort(() => Math.random() - 0.5).map((q, index) => {
        if (q.type === 'mc' && q.options) {
          const optionObjects = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctOptionIndex }));
          const shuffledOptions = optionObjects.sort(() => Math.random() - 0.5);
          return {
            ...q,
            id: index + 1,
            options: shuffledOptions.map(o => o.text),
            correctOptionIndex: shuffledOptions.findIndex(o => o.isCorrect)
          };
        }
        return {
          ...q,
          id: index + 1
        };
      });
      newExams.push({ code, questions: shuffledQ });
    }
    setShuffledExams(newExams);
    setActiveTab("shuffle");
  };

  
  const handleExportWord = (contentId: string, code: string) => {
    const printContent = document.getElementById(contentId);
    if (!printContent) return;
    
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>
      ${printContent.innerHTML}
      </body></html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `De_kiem_tra_Ma_${code}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (contentId: string) => {
    const printContent = document.getElementById(contentId);
    if (!printContent) return;
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    windowPrint?.document.write(`
      <html>
        <head>
          <title>In Đề Kiểm Tra</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <style>
            body { font-family: "Times New Roman", Times, serif; line-height: 1.5; padding: 20px; }
            h2 { text-align: center; }
            .question { margin-bottom: 15px; }
            .options { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 5px; }
            .option { padding-left: 10px; }
            .answers-title { margin-top: 30px; font-weight: bold; }
            .answers-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    windowPrint?.document.close();
    windowPrint?.focus();
    setTimeout(() => {
      windowPrint?.print();
      windowPrint?.close();
    }, 250);
  };

  const handleShare = async () => {
    try {
      const response = await fetch("/api/exams/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          examData: { examName, originalQuestions: questions },
          codes: shuffledExams 
        })
      });
      const data = await response.json();
      if (data.examId) {
        const url = new URL(window.location.href);
        url.search = `?examId=${data.examId}`;
        setShareLink(url.toString());
      }
    } catch (err) {
      alert("Lỗi chia sẻ đề thi.");
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileCheck className="w-8 h-8 text-emerald-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Tạo & Trộn Đề Kiểm Tra</h2>
              <p className="text-slate-500 text-sm mt-1">Tạo ma trận, sinh câu hỏi tự động và đảo mã đề lên đến 24 đề</p>
            </div>
          </div>

          <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
            <button 
              onClick={() => setActiveTab("matrix")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'matrix' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              1. Tạo Ma Trận & Đề
            </button>
            <button 
              onClick={() => setActiveTab("exam")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'exam' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              2. Đề Gốc
            </button>
            <button 
              onClick={() => setActiveTab("shuffle")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'shuffle' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              3. Trộn Đề & Xuất Bản
            </button>
          </div>

          {activeTab === "matrix" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
                  <input type="text" value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian (phút)</label>
                  <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại bài thi</label>
                  <select value={examType} onChange={e => setExamType(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="15p">15 phút</option>
                    <option value="45p">1 tiết (45p)</option>
                    <option value="mid">Giữa kỳ</option>
                    <option value="final">Cuối kỳ</option>
                  </select>
                </div>
              </div>

              {subject.toLowerCase().includes("toán") && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 space-y-4">
                  <h3 className="font-semibold text-emerald-800">Cấu trúc đề Toán (Số câu)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Trắc nghiệm</label>
                      <input type="number" value={qCounts.mc} onChange={e => setQCounts({...qCounts, mc: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-200 rounded-md focus:ring-emerald-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Đúng/Sai</label>
                      <input type="number" value={qCounts.tf} onChange={e => setQCounts({...qCounts, tf: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-200 rounded-md focus:ring-emerald-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Trả lời ngắn</label>
                      <input type="number" value={qCounts.sa} onChange={e => setQCounts({...qCounts, sa: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-200 rounded-md focus:ring-emerald-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Tự luận</label>
                      <input type="number" value={qCounts.essay} onChange={e => setQCounts({...qCounts, essay: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-200 rounded-md focus:ring-emerald-500 bg-white" />
                    </div>
                  </div>
                  
                  {availableTopics.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-emerald-800 mb-2">Chọn chủ đề từ Kế hoạch giáo dục (Tùy chọn)</label>
                      <div className="max-h-40 overflow-y-auto bg-white border border-emerald-200 rounded-lg p-2 space-y-1">
                        {availableTopics.map((topic, i) => (
                          <label key={i} className="flex items-start gap-2 p-1 hover:bg-emerald-50 rounded cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="mt-1 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                              checked={selectedTopics.includes(topic)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedTopics([...selectedTopics, topic]);
                                else setSelectedTopics(selectedTopics.filter(t => t !== topic));
                              }}
                            />
                            <span className="text-sm text-slate-700">{topic}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!subject.toLowerCase().includes("toán") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tổng số câu (Trắc nghiệm)</label>
                  <input type="number" value={totalQuestions} onChange={e => setTotalQuestions(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhập Cấu trúc Ma trận (Thủ công)</label>
                  <textarea 
                    value={matrix} 
                    onChange={e => setMatrix(e.target.value)} 
                    placeholder="Ví dụ: 50% Đại số (Hệ phương trình), 50% Hình học (Đường tròn). Mức độ: 40% Nhận biết..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg h-24 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hoặc Tải lên file Ma trận (Ảnh, PDF, Word)</label>
                  <div className="w-full px-4 py-3 border border-slate-300 rounded-lg h-24 flex items-center justify-center bg-slate-50 border-dashed relative hover:bg-slate-100 transition-colors cursor-pointer">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf,.docx,.doc" />
                    <div className="text-center">
                      <span className="text-sm text-slate-500 font-medium">{matrixFile ? matrixFile.name : "Nhấn hoặc kéo thả file vào đây"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yêu cầu bổ sung (Tùy chọn)</label>
                <textarea 
                  value={customPrompt} 
                  onChange={e => setCustomPrompt(e.target.value)} 
                  placeholder="Ví dụ: Đề bám sát đề minh họa BGD..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg h-20 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}
              
              <button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {isGenerating ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? "Đang tạo đề bằng AI..." : "Tạo Đề Gốc Bằng AI"}
              </button>
            </div>
          )}

          {activeTab === "exam" && (
            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Chưa có đề gốc. Vui lòng tạo đề ở bước 1.</div>
              ) : (
                <>
                  <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg">
                    <h3 className="font-bold text-lg text-slate-800">{examName}</h3>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Số mã đề:</label>
                        <input type="number" min="1" max="24" value={numCodes} onChange={e => setNumCodes(Number(e.target.value))} className="w-16 px-2 py-1 border border-slate-300 rounded-md" />
                      </div>
                      <button onClick={handleShuffle} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                        <Shuffle className="w-4 h-4" /> Trộn Đề
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg p-6 space-y-6 bg-white" id="original-exam">
                    <h2 className="text-xl font-bold text-center mb-6">{examName}</h2>
                    {questions.map((q, idx) => (
                      <div key={idx} className="pb-4 border-b border-slate-100 last:border-0">
                        <div className="font-medium text-slate-800 mb-3 flex items-start gap-2"><span className="font-bold whitespace-nowrap mt-1">Câu {idx + 1}:</span> <div className="markdown-body flex-1"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} >{q.content}</Markdown></div> <span className="text-xs text-emerald-600 font-normal mt-1 shrink-0">[{q.level}]</span></div>
                        
                        {q.type === 'mc' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className={`p-2 rounded-md border ${oIdx === q.correctOptionIndex ? 'bg-emerald-50 border-emerald-200 font-medium' : 'border-transparent'}`}>
                                {String.fromCharCode(65 + oIdx)}. <div className="markdown-body"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} >{opt}</Markdown></div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {q.type !== 'mc' && q.correctAnswer && (
                          <div className="mt-2 pl-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <span className="font-semibold text-emerald-800">Đáp án:</span> <div className="markdown-body"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} >{q.correctAnswer}</Markdown></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "shuffle" && (
            <div className="space-y-6">
              {shuffledExams.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Chưa có mã đề nào được trộn.</div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-4 items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                    <div>
                      <h3 className="font-bold text-emerald-800">Đã trộn thành công {shuffledExams.length} mã đề</h3>
                      <p className="text-sm text-emerald-600 mt-1">Sẵn sàng in ấn, xuất file hoặc chia sẻ cho học sinh làm bài Online.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleShare} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Chia sẻ HS Online
                      </button>
                    </div>
                  </div>

                  {shareLink && (
                    <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1 overflow-hidden">
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Link cho học sinh (Copy và gửi)</label>
                        <input type="text" readOnly value={shareLink} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-blue-600 font-medium" />
                      </div>
                      <button onClick={() => {navigator.clipboard.writeText(shareLink); alert('Đã copy!');}} className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 shrink-0 mt-4 sm:mt-0">
                        Copy Link
                      </button>
                    </div>
                  )}

                  <div className="space-y-8">
                    {shuffledExams.map((exam, index) => (
                      <div key={index} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200">
                          <h4 className="font-bold text-lg text-slate-800">Mã đề: {exam.code}</h4>
                          <div className="flex gap-2">
                            <button onClick={() => handlePrint(`print-exam-${exam.code}`)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 flex items-center gap-2">
                              <Printer className="w-4 h-4" /> In / PDF
                            </button>
                            <button onClick={() => handleExportWord(`print-exam-${exam.code}`, exam.code)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 flex items-center gap-2">
                              <Download className="w-4 h-4" /> Xuất Word
                            </button>
                          </div>
                        </div>
                        <div className="p-6">
                          <div id={`print-exam-${exam.code}`}>
                            <h2 style={{textAlign:'center', fontSize: '18px', fontWeight: 'bold'}}>{examName}</h2>
                            <h3 style={{textAlign:'center', fontSize: '16px', marginBottom: '5px'}}>Thời gian làm bài: {duration} phút</h3>
                            <h3 style={{textAlign:'center', fontSize: '16px', marginBottom: '20px'}}>Mã đề: {exam.code}</h3>
                            {exam.questions.map((q, idx) => (
                              <div key={idx} className="question" style={{marginBottom: '15px'}}>
                                <div><strong>Câu {idx + 1}:</strong> <div className="markdown-body"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} >{q.content}</Markdown></div></div>
                                {q.type === 'mc' && q.options && (
                                  <div className="options" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '5px'}}>
                                    {q.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="option" style={{paddingLeft: '10px'}}>
                                        {String.fromCharCode(65 + oIdx)}. <div className="markdown-body"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} >{opt}</Markdown></div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {q.type !== 'mc' && (
                                  <div style={{marginTop: '15px', marginBottom: '30px'}}>
                                    <em>(Học sinh làm bài vào giấy thi)</em>
                                  </div>
                                )}
                              </div>
                            ))}
                            <div style={{pageBreakBefore: 'always'}}></div>
                            <div className="answers-title">Đáp án Mã đề {exam.code}:</div>
                            <div className="answers-grid" style={{display: 'flex', flexWrap: 'wrap', marginTop: '10px', gap: '15px'}}>
                              {exam.questions.map((q, idx) => (
                                <div key={idx} style={{minWidth: '60px'}}>
                                  <strong>{idx + 1}.</strong> {q.type === 'mc' ? String.fromCharCode(65 + (q.correctOptionIndex || 0)) : <div className="markdown-body"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} >{q.correctAnswer || ''}</Markdown></div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
