const fs = require('fs');
const path = require('path');

const apiFiles = fs.readdirSync('api').filter(f => f.endsWith('.ts'));

let serverCode = `
import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
app.use(express.json({ limit: '50mb' }));

const sharedExamsStore = new Map();

function getAiClient(req: any) {
  let customKey = req.headers['x-gemini-api-key'] as string;
  if (customKey) {
    try { customKey = decodeURIComponent(customKey); } catch (e) {}
  }
  let apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key");
  return new GoogleGenAI({ apiKey: apiKey.replace(/[^\\x20-\\x7E]/g, '').trim() });
}

function handleAiError(error: any, req: any, res: any) {
  const errorMsg = error?.message || "";
  const isCustomKey = !!req.headers['x-gemini-api-key'];

  if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401 || errorMsg.includes("ACCOUNT_STATE_INVALID")) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch." });
    }
    return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản dịch vụ liên kết với API Key cá nhân của bạn đã bị vô hiệu hóa hoặc không hợp lệ." });
  }

  if (errorMsg.includes("suspended") || errorMsg.includes("PERMISSION_DENIED") || error?.status === 403) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch." });
    }
    return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản API Key cá nhân của bạn đã bị từ chối quyền truy cập." });
  }

  if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || error?.status === 429) {
    return res.status(429).json({ error: "Hệ thống đang quá tải hoặc hết hạn ngạch. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
  }

  console.error("Unhandled AI Error:", error);
  res.status(500).json({ error: errorMsg || "Đã xảy ra lỗi không xác định từ máy chủ AI. Vui lòng thử lại sau." });
}

async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  for (const model of ["gemini-3.6-flash", "gemini-3.1-pro-preview"]) {
    try {
      return await client.models.generateContent({ ...payloadOptions, model });
    } catch (e: any) {
      if (e?.message?.includes("429") || e?.message?.includes("quota") || e?.status === 429) continue;
      throw e;
    }
  }
  throw new Error("All models failed");
}
`;

for (const file of apiFiles) {
  const routePath = "/api/" + file.replace('.ts', '');
  let content = fs.readFileSync(path.join('api', file), 'utf8');
  
  // Extract handler
  const handlerMatch = content.match(/export default async function handler\([^)]+\)\s*\{([\s\S]*)\}/);
  if (handlerMatch) {
    let body = handlerMatch[1];
    
    // Remove the API key check from the vercel function
    body = body.replace(/const apiKey = process\.env\.GEMINI_API_KEY;\s*if \(!apiKey\) \{\s*return res\.status\(\d+\)\.json\([^)]+\);\s*\}/g, '');
    
    // Replace the fetch call to gemini with generateWithFallback
    const fetchRegex = /const\s+response\s*=\s*await\s+fetch\(`https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/[^`]+`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\},\s*body:\s*JSON\.stringify\(\{\s*contents:\s*(.*?)(?:,\s*generationConfig:\s*(.*?))?\s*\}\)\s*\}\);[\s\S]*?if\s*\(!response\.ok\)[\s\S]*?\}\s*const\s*(\w+)\s*=\s*data\.candidates\?\.\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text\s*\|\|\s*'[^']*';/g;

    body = body.replace(fetchRegex, (match, contents, config, varname) => {
      return `
    const response = await generateWithFallback(req, {
      contents: ${contents}
      ${config ? `, config: ${config}` : ''}
    });
    const ${varname} = response.text || '';
    `;
    });
    
    // One more fetchRegex for when generationConfig is missing but JSON format is different
    const fetchRegex2 = /const\s+response\s*=\s*await\s+fetch\(`https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/[^`]+`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\},\s*body:\s*JSON\.stringify\(\{\s*contents:\s*(\[\{\s*parts:\s*\[\{\s*text:\s*promptText\s*\}\]\s*\}\])\s*\}\)\s*\}\);[\s\S]*?if\s*\(!response\.ok\)[\s\S]*?\}\s*const\s*(\w+)\s*=\s*data\.candidates\?\.\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text\s*\|\|\s*'[^']*';/g;

    body = body.replace(fetchRegex2, (match, contents, varname) => {
      return `
    const response = await generateWithFallback(req, {
      contents: ${contents}
    });
    const ${varname} = response.text || '';
    `;
    });
    
    // Replace all catch blocks at the very end
    body = body.replace(/catch \((err|error|e)(: any)?\) \{\s*(?:console\.error\([^)]+\);\s*)?(?:return\s+)?res\.status\(\d+\)\.json\([^)]+\);\s*\}\s*$/g, (match, errVar) => {
      return `catch (${errVar}: any) {
    return handleAiError(${errVar}, req, res);
  }`;
    });
    // Another variation of catch
    body = body.replace(/catch \((err|error|e)(: any)?\) \{\s*(?:return\s+)?res\.status\(\d+\)\.json\(\{ error: [^}]+\} \);\s*\}\s*$/g, (match, errVar) => {
      return `catch (${errVar}: any) {
    return handleAiError(${errVar}, req, res);
  }`;
    });

    serverCode += `\napp.all("${routePath}", async (req, res) => {\n${body}\n});\n`;
  }
}

// Special case for exams
serverCode += `
app.get("/api/exams/:id", (req, res) => {
  const data = sharedExamsStore.get(req.params.id);
  if (data) res.json(data);
  else res.status(404).json({ error: "Exam not found" });
});

// Adding back chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    let fullPrompt = prompt;
    if (context) {
      fullPrompt = \`Ngữ cảnh: \${JSON.stringify(context)}\\n\\nCâu hỏi: \${prompt}\`;
    }
    const response = await generateWithFallback(req, {
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
    });
    res.json({ text: response.text });
  } catch (error: any) {
    return handleAiError(error, req, res);
  }
});
`;

serverCode += `
if (!process.env.VERCEL) {
  const PORT = 3000;
  if (process.env.NODE_ENV !== "production") {
    import("vite").then(async ({ createServer }) => {
      const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => console.log("Server running on port " + PORT));
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    app.listen(PORT, "0.0.0.0", () => console.log("Server running on port " + PORT));
  }
}
export default app;
`;

fs.writeFileSync('server.ts', serverCode);
