const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-1.5-flash"];
  let lastError: any = null;
  
  for (const model of models) {
    try {
      return await client.models.generateContent({ ...payloadOptions, model });
    } catch (e: any) {
      const errorMsg = e?.message || "";
      const status = e?.status;
      
      if (
        errorMsg.includes("429") || status === 429 || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") ||
        errorMsg.includes("503") || status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("overloaded") ||
        errorMsg.includes("not found") || status === 404
      ) {
        lastError = e;
        continue; // Try next model
      }
      throw e; // Other errors (401, 400) throw immediately
    }
  }
  if (lastError) throw lastError;
  throw new Error("503 UNAVAILABLE: Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.");
}`;

const replacement = `async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-2.0-flash"];
  let primaryError: any = null;
  
  for (const model of models) {
    try {
      return await client.models.generateContent({ ...payloadOptions, model });
    } catch (e: any) {
      const errorMsg = e?.message || "";
      const status = e?.status;
      
      if (
        errorMsg.includes("429") || status === 429 || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") ||
        errorMsg.includes("503") || status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("overloaded")
      ) {
        if (!primaryError) primaryError = e; // Keep the most relevant error
        continue; // Try next model
      }
      if (errorMsg.includes("not found") || status === 404) {
        continue; // Skip missing models
      }
      throw e; // Other errors (401, 400) throw immediately
    }
  }
  if (primaryError) throw primaryError;
  throw new Error("503 UNAVAILABLE: Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.");
}`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
