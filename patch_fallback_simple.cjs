const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-1.5-flash"];
  const maxRetries = 3;
  let lastError: any = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const model of models) {
      try {
        return await client.models.generateContent({ ...payloadOptions, model });
      } catch (e: any) {
        const errorMsg = e?.message || "";
        const status = e?.status;
        // On 429 (Rate Limit / Quota) or 503 (Overloaded), log and try the next model
        if (
          errorMsg.includes("429") || status === 429 || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") ||
          errorMsg.includes("503") || status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("overloaded")
        ) {
          console.log(\`Model \${model} failed on attempt \${attempt + 1} with \${status}. Retrying next model...\`);
          lastError = e;
          continue;
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
  if (lastError) throw lastError;
  throw new Error("503 UNAVAILABLE: Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.");
}`;

const replacement = `async function generateWithFallback(req: any, payloadOptions: any) {
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

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
