export default async function handler(req: any, res: any) {
  // Mocking the GET response because in-memory store doesn't work on Serverless.
  // Ideally, this should query a database.
  res.status(404).json({ error: "Exam not found (In-memory store not supported on Vercel)" });
}
