import { getClient } from './client';

interface GradeResult {
	correct: boolean;
	note?: string;
}

export async function gradeAnswer(
	stem: string,
	correctAnswer: string,
	userAnswer: string
): Promise<GradeResult> {
	const client = getClient();
	const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

	const prompt = `You are grading a C1 Spanish grammar answer.

Question: ${stem}
Expected answer: ${correctAnswer}
User's answer: ${userAnswer}

Evaluate if the user's answer is correct. Consider:
- Accent marks: flag if missing but meaning doesn't change; mark wrong if accent changes meaning
- Alternative conjugation forms (e.g., -ra/-se for imperfect subjunctive) are both correct
- Typos within 1 character: mark correct but note the typo

Respond with ONLY a JSON object (no markdown): { "correct": boolean, "note": "optional string or null" }`;

	const result = await model.generateContent(prompt);
	const text = result.response.text();

	let jsonStr = text.trim();
	if (jsonStr.startsWith('```')) {
		jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
	}

	return JSON.parse(jsonStr) as GradeResult;
}
