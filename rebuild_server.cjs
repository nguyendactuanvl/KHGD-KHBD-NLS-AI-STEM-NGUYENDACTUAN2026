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
  const content = fs.readFileSync(path.join('api', file), 'utf8');
  
  // Extract the body of `export default async function handler(req: any, res: any) { ... }`
  const handlerMatch = content.match(/export default async function handler\([^)]+\)\s*\{([\s\S]*)\}/);
  if (handlerMatch) {
    serverCode += `\napp.all("${routePath}", async (req, res) => {\n${handlerMatch[1]}\n});\n`;
  }
}

// Special case for exams
serverCode += `
app.get("/api/exams/:id", (req, res) => {
  const data = sharedExamsStore.get(req.params.id);
  if (data) res.json(data);
  else res.status(404).json({ error: "Exam not found" });
});
`;

serverCode += `
if (!process.env.VERCEL) {
  const PORT = 3000;
  if (process.env.NODE_ENV !== "production") {
    import("vite").then(async ({ createServer }) => {
      const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => console.log("Server running"));
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    app.listen(PORT, "0.0.0.0", () => console.log("Server running"));
  }
}
export default app;
`;

fs.writeFileSync('server.ts', serverCode);
