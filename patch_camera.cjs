const fs = require('fs');
let content = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf8');

// 1. Add states for camera
const state_insert = `
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
`;
content = content.replace("const [selectedFile, setSelectedFile] = useState<File | null>(null);", state_insert);

// 2. Add camera functions
const camera_funcs = `
  const startCamera = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Không thể truy cập camera. Vui lòng kiểm tra quyền hoặc kết nối.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], \`photo_\${Date.now()}.jpg\`, { type: 'image/jpeg' });
            setSelectedFile(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };
`;

content = content.replace("const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {", camera_funcs + "\n\n  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {");


// 3. Update UI
const oldUI = `              {!selectedFile ? (
                <>
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Tải lên đề bài của bạn</h3>
                  <p className="text-slate-500 mb-6 text-sm">Hỗ trợ file ảnh, PDF, Word (.docx), hoặc file text</p>
                  <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Chọn File
                  </button>
                </>
              ) : (`;

const newUI = `              {isCameraActive ? (
                <div className="w-full flex flex-col items-center">
                   <div className="relative w-full max-w-md bg-black rounded-lg overflow-hidden mb-4">
                     <video ref={videoRef} className="w-full h-auto" playsInline autoPlay></video>
                     <canvas ref={canvasRef} className="hidden"></canvas>
                   </div>
                   <div className="flex gap-4">
                     <button onClick={stopCamera} className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors">
                       Hủy
                     </button>
                     <button onClick={capturePhoto} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                       <Camera className="w-5 h-5" /> Chụp Ảnh
                     </button>
                   </div>
                </div>
              ) : !selectedFile ? (
                <>
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Tải lên hoặc chụp ảnh đề bài</h3>
                  <p className="text-slate-500 mb-6 text-sm">Hỗ trợ file ảnh, PDF, Word (.docx), hoặc file text</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                      <Upload className="w-4 h-4" /> Chọn File
                    </button>
                    <button 
                      className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
                      onClick={startCamera}
                    >
                      <Camera className="w-4 h-4" /> Chụp Ảnh
                    </button>
                  </div>
                </>
              ) : (`;

content = content.replace(oldUI, newUI);

fs.writeFileSync('src/pages/ExerciseSolver.tsx', content);

