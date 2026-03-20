import { getClient } from './client';
import type { GeneratedQuestion, QuizRound } from '$lib/types';
import type { TopicId } from '$lib/topics';

const SYSTEM_PROMPT = `You are a C1-level Spanish grammar examiner creating practice questions for the DELE C1 exam.

Cultural context: The learner lives in Spain. Use Peninsular Spanish (vosotros, leísmo accepted, Spanish idioms and cultural references). No Latin American variants unless the topic explicitly requires comparison.

Rules:
- All sentences must be natural, authentic Spanish — the kind found in Spanish newspapers (El País, El Mundo), essays, or formal conversation.
- Questions must test genuine C1-level knowledge. For grammar topics, test grammar not vocabulary. For vocabulary/culture topics (verbos de cambio, dichos y refranes, modismos), test idiomatic knowledge and correct usage in context.
- Each question must have exactly one unambiguous correct answer.
- Explanations must be concise (2-3 sentences), in English, and reference the specific grammar rule or explain the idiom/expression.
- For cloze passages, use coherent mini-texts (not isolated sentences).
- Vary difficulty within the round.
- Do not reuse stems from the "recent stems" list provided.`;

const JSON_SCHEMA = `{
  "questions": [
    // For multiple_choice — options should NOT have letter prefixes, just the text. correct_answer must be the FULL TEXT of the correct option, not a letter.
    { "format": "multiple_choice", "topic": "<topic_id>", "stem": "Sentence with ___.", "options": ["hubiera ido", "habría ido", "haya ido", "fue"], "correct_answer": "hubiera ido", "explanation": "..." },
    // For fill_in_blank:
    { "format": "fill_in_blank", "topic": "<topic_id>", "stem": "Sentence with ___.", "correct_answer": "para", "acceptable_answers": ["para"], "explanation": "..." },
    // For cloze — same rule: correct_answer is the full text, not a letter. Options have no letter prefixes.
    { "format": "cloze", "topic": "<topic_id>", "passage": "Text with ___(1) and ___(2)...", "blanks": [
      { "id": 1, "type": "free", "correct_answer": "tuviera", "explanation": "..." },
      { "id": 2, "type": "dropdown", "options": ["iría", "voy", "fui", "iba"], "correct_answer": "iría", "explanation": "..." }
    ]}
  ]
}

CRITICAL: correct_answer must always be the EXACT FULL TEXT that matches one of the options, NEVER a letter like "a", "b", "c", "d". Options must NOT have letter prefixes like "a) " or "b) ".`;

export async function generateQuestions(
	selectedTopics: TopicId[],
	recentStems: string[]
): Promise<QuizRound> {
	const client = getClient();
	const model = client.getGenerativeModel({
		model: 'gemini-2.5-flash',
		systemInstruction: SYSTEM_PROMPT
	});

	const userPrompt = `Generate a quiz round of 10 questions for C1 Spanish grammar practice.

Topics to cover: ${selectedTopics.join(', ')}
Format distribution: 4 multiple choice, 3 fill-in-the-blank, 1-2 cloze passages (totaling 3 blanks)

Important: The total question count visible to the user = 10. Cloze blanks count individually toward the 10. So if you have 4 MC + 3 fill-in + 1 cloze passage with 3 blanks = 10 total.

Recent stems to avoid (do not reuse these):
${recentStems.length > 0 ? recentStems.map((s) => `- ${s}`).join('\n') : '(none)'}

Respond with ONLY a JSON object (no markdown, no code fences) matching this schema:
${JSON_SCHEMA}`;

	const result = await model.generateContent(userPrompt);
	const text = result.response.text();

	// Try to parse JSON, stripping any markdown fences
	let jsonStr = text.trim();
	if (jsonStr.startsWith('```')) {
		jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
	}

	const parsed = JSON.parse(jsonStr) as QuizRound;
	validateQuizRound(parsed);
	return parsed;
}

const LETTER_INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

function fixCorrectAnswer(options: string[], item: { correct_answer: string }) {
	// If correct_answer is already one of the options, nothing to do
	if (options.includes(item.correct_answer)) return;

	// If it's a letter like "a", "b", "c", "d" — resolve to the actual option text
	const lower = item.correct_answer.trim().toLowerCase().replace(/\)$/, '');
	if (lower in LETTER_INDEX) {
		const idx = LETTER_INDEX[lower];
		if (idx < options.length) {
			console.warn(`[generate] Fixed correct_answer "${item.correct_answer}" -> "${options[idx]}"`);
			item.correct_answer = options[idx];
		}
	}
}

function validateQuizRound(round: QuizRound): void {
	if (!round.questions || !Array.isArray(round.questions)) {
		throw new Error('Invalid quiz round: missing questions array');
	}

	// Count total items (cloze blanks count individually)
	let totalItems = 0;
	for (const q of round.questions) {
		if (q.format === 'cloze') {
			totalItems += q.blanks.length;
		} else {
			totalItems += 1;
		}
	}

	if (totalItems < 8 || totalItems > 12) {
		throw new Error(`Invalid quiz round: expected ~10 items, got ${totalItems}`);
	}

	for (const q of round.questions) {
		if (!q.format || !q.topic) {
			throw new Error('Invalid question: missing format or topic');
		}
		if (q.format === 'multiple_choice') {
			if (!q.stem || !q.options || q.options.length !== 4 || !q.correct_answer) {
				throw new Error('Invalid multiple choice question');
			}
			// Strip letter prefixes from options (e.g. "a) hubiera" -> "hubiera")
			q.options = q.options.map((o) => o.replace(/^[a-d]\)\s*/i, ''));
			// Fix correct_answer if it's a letter index instead of the actual text
			fixCorrectAnswer(q.options, q);
		} else if (q.format === 'fill_in_blank') {
			if (!q.stem || !q.correct_answer) {
				throw new Error('Invalid fill-in-blank question');
			}
		} else if (q.format === 'cloze') {
			if (!q.passage || !q.blanks || q.blanks.length === 0) {
				throw new Error('Invalid cloze question');
			}
			for (const blank of q.blanks) {
				if (blank.options) {
					blank.options = blank.options.map((o) => o.replace(/^[a-d]\)\s*/i, ''));
					fixCorrectAnswer(blank.options, blank);
				}
			}
		}
	}
}

export function flattenQuestions(round: QuizRound) {
	const display: {
		position: number;
		format: string;
		topic: TopicId;
		stem: string;
		options?: string[];
		blankId?: number;
		correctAnswer: string;
		explanation: string;
		questionData: GeneratedQuestion;
	}[] = [];

	let position = 1;
	for (const q of round.questions) {
		if (q.format === 'cloze') {
			for (const blank of q.blanks) {
				display.push({
					position,
					format: 'cloze',
					topic: q.topic,
					stem: q.passage,
					options: blank.type === 'dropdown' ? blank.options : undefined,
					blankId: blank.id,
					correctAnswer: blank.correct_answer,
					explanation: blank.explanation,
					questionData: q
				});
				position++;
			}
		} else {
			display.push({
				position,
				format: q.format,
				topic: q.topic,
				stem: q.stem,
				options: q.format === 'multiple_choice' ? q.options : undefined,
				correctAnswer: q.correct_answer,
				explanation: q.explanation,
				questionData: q
			});
			position++;
		}
	}

	return display;
}
