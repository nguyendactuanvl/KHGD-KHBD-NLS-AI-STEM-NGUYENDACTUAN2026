import { useEffect, useState } from "react";
import { Circular } from "../types";
import { FileText, ShieldCheck, AlertCircle } from "lucide-react";

export function Circulars() {
  const [circulars, setCirculars] = useState<Circular[]>([]);

  useEffect(() => {
    fetch("/api/circulars")
      .then(res => res.json())
      .then(data => setCirculars(data));
  }, []);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Bộ lọc thông tư & Văn bản</h2>
          <p className="text-slate-500 mt-1">Cập nhật tự động các quy định mới nhất từ Bộ GD&ĐT</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 flex gap-4">
          <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Hệ thống đang hoạt động tốt</h3>
            <p className="text-blue-800 text-sm mt-1">
              Kế hoạch giáo dục của bạn đang được áp dụng chuẩn theo các Thông tư mới nhất năm học 2026-2027.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {circulars.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4 items-start">
              <div className="p-3 bg-slate-100 rounded-lg shrink-0">
                <FileText className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-slate-800">{c.id}</h3>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    Hiệu lực
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 mb-2">Ngày ban hành: {c.date}</p>
                <p className="text-slate-700">{c.title}</p>
                {c.id.includes("2422") && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg flex gap-2">
                    <AlertCircle className="h-5 w-5 text-purple-600 shrink-0" />
                    <p className="text-sm text-purple-800">
                      <strong>Lưu ý quan trọng:</strong> Khung năng lực AI yêu cầu bổ sung cột "Năng lực AI" vào kế hoạch giáo dục. Hệ thống đã tự động thêm cột này vào mẫu.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
