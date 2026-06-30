/**
 * Local development API server (port 3001).
 * Mirrors the /api/explain Vercel serverless function so you can
 * test the full AI explanation flow with `npm run dev`.
 *
 * Run alongside the Vite dev server:
 *   Terminal 1: npm run dev
 *   Terminal 2: npm run dev:server
 */
import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

app.post('/api/explain', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
  }

  const { student, scholarship, matchFactors, score, category } = req.body;
  if (!student || !scholarship) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const positiveFactors = (matchFactors || []).filter((f: any) => f.points > 0);

  const systemInstruction = `You are a professional university scholarship advisor helping a student understand scholarship matches.
Write a concise, encouraging 2-3 sentence explanation of why this scholarship is a good fit for them.

CRITICAL RULES:
1. Use ONLY the information provided. Do NOT infer or invent eligibility details.
2. Never claim guaranteed eligibility. Use "appears to meet," "could be a strong fit," etc.
3. If a field says "See website," advise the student to verify on the official page.
4. Conversational, professional, friendly tone. No bullet points.
5. Exactly 2 to 3 sentences.`;

  const promptText = `
Student Profile:
- Year: ${student.yearOfStudy}
- Faculty: ${student.faculty}
- Program: ${student.programMajor || 'Not specified'}
- GPA: ${student.gpaRange}
- Citizenship: ${student.citizenship}
- Province: ${student.province}
- Financial Need: ${student.financialNeed ? 'Yes' : 'No'}
- Identities: ${student.identities?.join(', ') || 'None'}
- Interests: ${student.interests?.join(', ') || 'None'}

Scholarship:
- Name: ${scholarship.name}
- Organization: ${scholarship.organization}
- Amount: ${scholarship.amount}
- Deadline: ${scholarship.deadline}
- Eligibility: ${scholarship.eligibilitySummary}

Match Factors:
${positiveFactors.map((f: any) => `- ${f.category}: ${f.description} (+${f.points})`).join('\n')}
- Score: ${score}/100 (${category})

Explain why this scholarship fits this student.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
      config: { systemInstruction, temperature: 0.3, maxOutputTokens: 150 },
    });

    const text = response?.text?.trim();
    if (!text) return res.status(500).json({ error: 'Empty Gemini response.' });
    return res.json({ explanation: text });
  } catch (err: any) {
    console.error('Gemini error:', err?.message || err);
    return res.status(500).json({ error: 'Gemini API call failed.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
});
