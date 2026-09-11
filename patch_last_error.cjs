const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldFunc = `    // If we exhausted all models in this attempt, wait before next attempt
    if (attempt < maxRetries - 1) {
      await delay(2000 * (attempt + 1));
    }
  }
  throw new Error("503 UNAVAILABLE: Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.");
}`;

const newFunc = `    // If we exhausted all models in this attempt, wait before next attempt
    if (attempt < maxRetries - 1) {
      await delay(2000 * (attempt + 1));
    }
  }
  if (lastError) throw lastError;
  throw new Error("503 UNAVAILABLE: Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.");
}`;

const fullOld = `async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-1.5-flash"];
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {`;

const fullNew = `async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-1.5-flash"];
  const maxRetries = 3;
  let lastError: any = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {`;

content = content.replace(fullOld, fullNew);
content = content.replace(oldFunc, newFunc);
content = content.replace('          continue;', '          lastError = e;\n          continue;');
fs.writeFileSync('server.ts', content);
