const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetFunction = `async function generateWithFallback(req: any, payloadOptions: any) {
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

const replacementFunction = `const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-2.0-flash"];
  let primaryError: any = null;
  
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
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
          if (!primaryError) primaryError = e;
          continue; 
        }
        if (errorMsg.includes("not found") || status === 404) {
          continue;
        }
        throw e; // Non-retryable
      }
    }
    
    // If all models failed with 429/503, wait and retry
    if (primaryError && attempt < maxRetries - 1) {
      console.warn(\`Attempt \${attempt + 1} failed with Quota/Overload. Retrying in \${2000 * (attempt + 1)}ms...\`);
      await delay(2000 * (attempt + 1) + Math.random() * 1000);
    }
  }
  
  if (primaryError) throw primaryError;
  throw new Error("503 UNAVAILABLE: Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.");
}`;

if (content.includes('async function generateWithFallback(req: any, payloadOptions: any) {')) {
   // The file already has a delay function above it, let's just replace the function body
   let withoutDelayFunction = replacementFunction.split('async function generateWithFallback')[1];
   content = content.replace(targetFunction, 'async function generateWithFallback' + withoutDelayFunction);
   fs.writeFileSync('server.ts', content);
   console.log("Success patch");
} else {
   console.log("Not found target");
}

