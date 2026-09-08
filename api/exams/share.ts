import { Type } from "@google/genai";
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { examData, codes } = req.body;
      const examId = Math.random().toString(36).substring(2, 10);
      sharedExamsStore.set(examId, { examData, codes, createdAt: Date.now() });
      res.json({ examId });
    } catch(e) {
      res.status(500).json({ error: "Failed to share exam" });
    }
}
