const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const oldModalContent = `            <p className="mt-2 text-xs text-slate-500">
              Key này sẽ được lưu an toàn trên trình duyệt của bạn (localStorage) và sử dụng để bỏ qua giới hạn biến môi trường của hệ thống.
            </p>`;

const newModalContent = `            <p className="mt-2 text-xs text-slate-500">
              Key này sẽ được lưu an toàn trên trình duyệt của bạn (localStorage) và sử dụng để bỏ qua giới hạn biến môi trường của hệ thống.
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              <p className="font-semibold mb-1">Hướng dẫn lấy API Key miễn phí:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Google AI Studio</a></li>
                <li>Đăng nhập bằng tài khoản Google của bạn</li>
                <li>Nhấn nút <strong>Create API Key</strong></li>
                <li>Copy mã Key và dán vào ô bên trên</li>
              </ol>
            </div>`;

code = code.replace(oldModalContent, newModalContent);
fs.writeFileSync('src/components/SettingsModal.tsx', code);
