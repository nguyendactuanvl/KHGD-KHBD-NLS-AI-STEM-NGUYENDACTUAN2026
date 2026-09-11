import re

with open('src/pages/ExerciseSolver.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states for camera
state_insert = """
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
"""
content = content.replace("const [selectedFile, setSelectedFile] = useState<File | null>(null);", state_insert)

# 2. Add camera functions
camera_funcs = """
  // Start Camera
  const startCamera = async () => {
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

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  // Capture Photo
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
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFile(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };
"""

content = content.replace("export function ExerciseSolver() {", "export function ExerciseSolver() {\n" + camera_funcs)

# Remove the previously duplicated if somehow I placed it wrong... wait, `export function ExerciseSolver()` is above `useState`.
# I should put functions after state declarations.

