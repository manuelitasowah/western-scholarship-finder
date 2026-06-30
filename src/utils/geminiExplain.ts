import { StudentProfile, MatchResult } from '../types';

/**
 * Calls the /api/explain serverless endpoint to generate a personalized
 * match explanation via Gemini. The API key stays server-side.
 * Falls back to a rules-based explanation if the call fails.
 */
export async function generateExplanation(student: StudentProfile, result: MatchResult): Promise<string> {
  const { scholarship, score, matchFactors, category } = result;
  const positiveFactors = matchFactors.filter(f => f.points > 0);

  // Build a rule-based fallback in case the API call fails
  const positiveDescList = positiveFactors.map(f => f.description).join(' ');
  const fallbackExplanation = `Based on our matching rules, this scholarship is a ${category} (${score}/100) for your ${student.yearOfStudy} year in ${student.faculty}. ${
    positiveFactors.length > 0
      ? `Key matching factors: ${positiveDescList}`
      : 'It meets your core eligibility criteria.'
  }`;

  try {
    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student,
        scholarship,
        matchFactors,
        score,
        category,
      }),
    });

    if (!response.ok) {
      console.warn(`/api/explain returned ${response.status}. Using fallback.`);
      return fallbackExplanation;
    }

    const data = await response.json();
    return data.explanation?.trim() || fallbackExplanation;
  } catch (err) {
    console.error('Error calling /api/explain:', err);
    return fallbackExplanation;
  }
}
