const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'api');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles(apiDir).filter(f => f.endsWith('.ts') && !f.endsWith('_gemini.ts'));

const inlineLogic = `
function getAiClient(req: any) {
  let customKey = req.headers['x-gemini-api-key'] as string;
  if (customKey) {
    try {
      customKey = decodeURIComponent(customKey);
    } catch (e) {
    }
  }
  let apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key");
  apiKey = apiKey.replace(/[^\\x20-\\x7E]/g, '').trim();
  return new GoogleGenAI({ apiKey });
}

async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError: any;
  for (const model of models) {
    try {
      console.log('Trying model ' + model + '...');
      const payload = { ...payloadOptions, model };
      return await client.models.generateContent(payload);
    } catch (error: any) {
      console.error('Model ' + model + ' failed:', error?.message);
      lastError = error;
      const errorMsg = error?.message || "";
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429 || errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503 || error?.status === 500 || error?.status === 404 || errorMsg.includes("no longer available")) {
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
`;

allFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  if (content.includes('_gemini')) {
    // Remove the old import
    content = content.replace(/import\s+\{\s*generateWithFallback\s*\}\s+from\s+['"]\.\.?\/_gemini['"];?/g, '');
    
    // Add GoogleGenAI to existing import if Type is imported
    if (content.includes('import { Type } from "@google/genai";')) {
       content = content.replace('import { Type } from "@google/genai";', 'import { Type, GoogleGenAI } from "@google/genai";');
    } else {
       content = 'import { GoogleGenAI } from "@google/genai";\n' + content;
    }

    // Insert the inline logic after the imports
    if (content.includes('export const config =')) {
        content = content.replace('export const config =', inlineLogic + '\nexport const config =');
    } else if (content.includes('const sharedExamsStore')) {
        content = content.replace('const sharedExamsStore', inlineLogic + '\nconst sharedExamsStore');
    } else if (content.includes('export default')) {
        content = content.replace('export default', inlineLogic + '\nexport default');
    }

    fs.writeFileSync(f, content);
    console.log("Inlined in " + f);
  }
});
