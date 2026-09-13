const fs = require('fs');
let code = fs.readFileSync('src/lib/apiFetch.ts', 'utf8');

// First add uploadFileChunked at the top or bottom
if (!code.includes('uploadFileChunked')) {
  code = `
export async function uploadFileChunked(fileData: string, type: string): Promise<string> {
  const fileId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const chunkSize = 250 * 1024; // 250KB chunks to be very safe against Nginx 1MB limits
  const totalChunks = Math.ceil(fileData.length / chunkSize);
  
  for (let i = 0; i < totalChunks; i++) {
    const chunkData = fileData.substring(i * chunkSize, (i + 1) * chunkSize);
    const res = await fetch('/api/upload-chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, chunkIndex: i, totalChunks, chunkData, type })
    });
    if (!res.ok) {
      throw new Error("Lỗi khi tải file lên (phần " + (i + 1) + "/" + totalChunks + "). Vui lòng thử lại.");
    }
  }
  return fileId;
}

` + code;
}

// Now modify apiFetch to intercept large bodies
const interceptCode = `
  if (options.body && typeof options.body === 'string' && options.body.length > 250 * 1024) {
    try {
      const parsedBody = JSON.parse(options.body);
      let modified = false;
      
      if (parsedBody.files && Array.isArray(parsedBody.files)) {
        parsedBody.fileIds = parsedBody.fileIds || [];
        for (let i = 0; i < parsedBody.files.length; i++) {
          const f = parsedBody.files[i];
          if (f.data && f.data.length > 100 * 1024) {
            const fileId = await uploadFileChunked(f.data, f.type);
            parsedBody.fileIds.push(fileId);
            f.data = ""; // Clear large data
            modified = true;
          }
        }
        // Filter out empty data files if they were offloaded
        parsedBody.files = parsedBody.files.filter((f: any) => f.data.length > 0);
      }
      
      if (parsedBody.file && typeof parsedBody.file === 'string' && parsedBody.file.length > 100 * 1024) {
        const fileId = await uploadFileChunked(parsedBody.file, parsedBody.type || 'text/plain');
        parsedBody.fileId = fileId;
        parsedBody.file = ""; // Clear
        modified = true;
      }
      
      if (modified) {
        options.body = JSON.stringify(parsedBody);
      }
    } catch (e) {
      console.warn("Could not chunk upload:", e);
    }
  }
`;

if (!code.includes('options.body.length > 250')) {
  code = code.replace(/export async function apiFetch\(url: string, options: RequestInit = \{\}\): Promise<Response> \{/, 'export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {' + interceptCode);
}

fs.writeFileSync('src/lib/apiFetch.ts', code);
console.log('Modified apiFetch');
