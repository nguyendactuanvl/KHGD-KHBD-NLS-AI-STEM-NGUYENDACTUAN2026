const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldFunc = `async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  for (const model of ["gemini-3.6-flash", "gemini-3.1-pro-preview"]) {
    try {
      return await client.models.generateContent({ ...payloadOptions, model });
    } catch (e: any) {
      if (e?.message?.includes("429") || e?.message?.includes("quota") || e?.status === 429 || e?.message?.includes("503") || e?.status === 503 || e?.message?.includes("UNAVAILABLE")) continue;
      throw e;
    }
  }
  throw new Error("429 RESOURCE_EXHAUSTED All models failed");
}`;

const newFunc = `const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-2.5-flash", "gemini-2.5-pro"];
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const model of models) {
      try {
        return await client.models.generateContent({ ...payloadOptions, model });
      } catch (e: any) {
        const errorMsg = e?.message || "";
        const status = e?.status;
        if (
          errorMsg.includes("429") || errorMsg.includes("quota") || status === 429 || 
          errorMsg.includes("503") || status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("overloaded")
        ) {
          console.log(\`Model \${model} failed on attempt \${attempt + 1}. Retrying...\`);
          continue; // Try next model or next attempt
        }
        if (errorMsg.includes("not found") || status === 404) {
             continue; // Model might not exist, try next one
        }
        throw e; // Other errors (like 401, 400) throw immediately
      }
    }
    // If we exhausted all models in this attempt, wait before next attempt
    if (attempt < maxRetries - 1) {
      await delay(2000 * (attempt + 1));
    }
  }
  throw new Error("503 UNAVAILABLE: Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.");
}`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('server.ts', content);
