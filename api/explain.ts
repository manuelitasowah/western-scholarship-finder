import { GoogleGenAI } from '@google/genai';

// Vercel serverless function — GEMINI_API_KEY lives only here, never in the browser
export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { student, scholarship, matchFactors, score, category } = req.body;

  if (!student || !scholarship) {
    return res.status(400).json({ error: 'Missing required fields: student and scholarship.' });
  }

  const positiveFactors = (matchFactors || []).filter((f: any) => f.points > 0);

  const systemInstruction = `You are a professional university scholarship advisor helping a student understand scholarship matches.
Write a concise, encouraging 2-3 sentence explanation of why this scholarship is a good fit for them.

CRITICAL RULES:
1. Use ONLY the information provided in the prompt. Do NOT infer, guess, or invent any eligibility details.
2. Be honest — never say the student is guaranteed to qualify. Use language like "appears to meet," "could be a strong fit," or "is worth exploring."
3. If any field is marked "See website" or is ambiguous, advise the student to verify directly on the official page.
4. Keep the tone conversational, professional, and friendly. No bullet points.
5. Write exactly 2 to 3 sentences. No more, no less.`;

  const promptText = `
Student Profile:
- Year of Study: ${student.yearOfStudy} Year
- Faculty: ${student.faculty}
- Program/Major: ${student.programMajor || 'Not specified'}
- GPA Range: ${student.gpaRange}
- Citizenship: ${student.citizenship}
- Province: ${student.province}
- Financial Need: ${student.financialNeed ? 'Yes' : 'No'}
- Identity Attributes: ${student.identities?.length > 0 ? student.identities.join(', ') : 'None/Prefer not to say'}
- Interests: ${student.interests?.length > 0 ? student.interests.join(', ') : 'None'}

Scholarship:
- Name: ${scholarship.name}
- Offered by: ${scholarship.organization}
- Value: ${scholarship.amount}
- Deadline: ${scholarship.deadline}
- Eligibility Summary: ${scholarship.eligibilitySummary}

Calculated Match Factors:
${positiveFactors.map((f: any) => `- ${f.category}: ${f.description} (+${f.points} pts)`).join('\n')}
- Match Score: ${score}/100 (${category})

Explain why this scholarship fits this student.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 150,
      }
    });

    const text = response?.text?.trim();
    if (!text) {
      return res.status(500).json({ error: 'Empty response from Gemini.' });
    }

    return res.status(200).json({ explanation: text });
  } catch (err: any) {
    console.error('Gemini API error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to generate explanation.' });
  }
}
