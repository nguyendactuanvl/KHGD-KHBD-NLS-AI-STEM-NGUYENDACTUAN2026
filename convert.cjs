const fs = require('fs');

const code = fs.readFileSync('server.ts', 'utf8');

const routeRegex = /app\.(post|get)\("\/api\/([^"]+)"(?:,\s*express\.json\([^)]+\))?,\s*(?:async\s*)?\((req,\s*res)\)\s*=>\s*\{([\s\S]*?)\n  \}\);/g;

let match;
while ((match = routeRegex.exec(code)) !== null) {
  const method = match[1].toUpperCase();
  const routePath = match[2]; // e.g. generate-plan, exams/share, exams/:id
  let body = match[4];
  
  if (routePath.includes(':')) continue; // skip dynamic routes for now or handle them specially
  
  const filename = `api/${routePath}.ts`;
  
  // ensure dir exists
  const dir = filename.substring(0, filename.lastIndexOf('/'));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  let functionCode = `import { Type } from "@google/genai";
import { generateWithFallback } from "./_gemini";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

const sharedExamsStore = new Map();

export default async function handler(req: any, res: any) {
  if (req.method !== '${method}') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  ${body}
}
`;

  fs.writeFileSync(filename, functionCode);
  console.log(`Created ${filename}`);
}

