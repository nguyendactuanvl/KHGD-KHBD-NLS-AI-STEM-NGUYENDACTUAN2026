const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add chunkStore and upload endpoint
const chunkStoreCode = `
const chunkStore = new Map<string, { chunks: string[], type: string, total: number, timestamp: number }>();

app.post("/api/upload-chunk", (req, res) => {
  const { fileId, chunkIndex, totalChunks, chunkData, type } = req.body;
  if (!chunkStore.has(fileId)) {
    chunkStore.set(fileId, { chunks: new Array(totalChunks), type, total: totalChunks, timestamp: Date.now() });
  }
  const fileEntry = chunkStore.get(fileId)!;
  fileEntry.chunks[chunkIndex] = chunkData;
  fileEntry.timestamp = Date.now();
  res.json({ success: true });
});

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of chunkStore.entries()) {
    if (now - entry.timestamp > 10 * 60 * 1000) {
      chunkStore.delete(id);
    }
  }
}, 60 * 1000);

function resolveFiles(reqBody: any) {
  const files = reqBody.files || [];
  const fileIds = reqBody.fileIds || [];
  for (const id of fileIds) {
    const entry = chunkStore.get(id);
    if (entry) {
      files.push({ data: entry.chunks.join(''), type: entry.type });
      chunkStore.delete(id);
    }
  }
  return files;
}

function resolveSingleFile(reqBody: any) {
  let { file, type, fileId } = reqBody;
  if (fileId && chunkStore.has(fileId)) {
    const entry = chunkStore.get(fileId)!;
    file = entry.chunks.join('');
    type = entry.type;
    chunkStore.delete(fileId);
  }
  return { file, type };
}
`;

code = code.replace(/const app = express\(\);\n/, 'const app = express();\n' + chunkStoreCode + '\n');

// Replace { files } = req.body
code = code.replace(/const \{ files,?(.*?) \} = req.body;/g, (match, p1) => {
  let replacements = [];
  if (p1.includes('lesson') || p1.includes('subject') || p1.includes('grade') || p1.includes('topic') || p1.includes('textbook')) {
    return `const { ${p1.trim().replace(/^,\s*/, '')} } = req.body;\n      const files = resolveFiles(req.body);`;
  }
  return `const files = resolveFiles(req.body);`;
});

// Specifically fix /api/generate-lesson-plan-file
code = code.replace(/const { lesson, subject, files, textbook } = req.body;/, 'const { lesson, subject, textbook } = req.body;\n      const files = resolveFiles(req.body);');

// Specifically fix /api/generate-plan
code = code.replace(/const { subject, grade, topic, files } = req.body;/, 'const { subject, grade, topic } = req.body;\n      const files = resolveFiles(req.body);');

// Replace { file, type } in extract-data
code = code.replace(/const \{ file, type \} = req\.body;/, 'const { file, type } = resolveSingleFile(req.body);');

fs.writeFileSync('server.ts', code);
console.log('Modified server.ts');
