const fs = require('fs');
const glob = require('glob');

const newFallback = `const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-2.0-flash"];
  let primaryError: any = null;
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const model of models) {
      try {
        console.log(\`Trying model \${model} (attempt \${attempt + 1})...\`);
        return await client.models.generateContent({ ...payloadOptions, model });
      } catch (error: any) {
        console.error(\`Model \${model} failed:\`, error?.message);
        const errorMsg = error?.message || "";
        const status = error?.status;
        
        if (
          errorMsg.includes("429") || status === 429 || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") ||
          errorMsg.includes("503") || status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("overloaded") ||
          error?.status === 500 || errorMsg.includes("no longer available")
        ) {
          if (!primaryError) primaryError = error;
          continue; 
        }
        if (errorMsg.includes("not found") || status === 404) {
          continue;
        }
        throw error;
      }
    }
    if (primaryError && attempt < maxRetries - 1) {
      console.warn(\`Attempt \${attempt + 1} failed with Quota/Overload. Retrying in \${3000 * (attempt + 1)}ms...\`);
      await delay(3000 * (attempt + 1) + Math.random() * 1000);
    }
  }
  throw primaryError;
}`;

const files = glob.sync('api/*.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Extract old generateWithFallback
  const match = content.match(/async function generateWithFallback[\s\S]*?throw lastError;\n?}/);
  if (match) {
    let replaced = content.replace(match[0], newFallback);
    fs.writeFileSync(file, replaced);
    console.log("Patched", file);
  } else {
    // If it has throw primaryError;
    const match2 = content.match(/async function generateWithFallback[\s\S]*?throw primaryError;\n?}/);
    if (match2) {
      let replaced = content.replace(match2[0], newFallback);
      fs.writeFileSync(file, replaced);
      console.log("Patched", file);
    } else {
      console.log("Could not patch", file);
    }
  }
});

