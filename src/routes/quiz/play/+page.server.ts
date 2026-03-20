import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { sessions, questions, answers } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateQuestions, flattenQuestions } from '$lib/server/ai/generate';
import { gradeAnswer } from '$lib/server/ai/grade';
import { selectAdaptiveTopics } from '$lib/server/adaptive';
import { topicIds, type TopicId } from '$lib/topics';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const mode = url.searchParams.get('mode') ?? 'adaptive';
	const topicsParam = url.searchParams.get('topics');
	const vocabParam = url.searchParams.get('vocab');

	let selectedTopics: TopicId[];
	if (mode === 'manual' && topicsParam) {
		selectedTopics = topicsParam.split(',').filter((t): t is TopicId => topicIds.includes(t as TopicId));
		if (selectedTopics.length === 0 && !vocabParam) {
			throw error(400, 'No valid topics selected');
		}
	} else {
		selectedTopics = await selectAdaptiveTopics();
	}

	// Append explicitly selected vocab topics
	if (vocabParam) {
		const vocabTopics = vocabParam.split(',').filter((t): t is TopicId => topicIds.includes(t as TopicId));
		selectedTopics = [...selectedTopics, ...vocabTopics];
	}

	// Get recent stems to avoid repetition
	const recentQuestions = await db
		.select({ stem: questions.stem })
		.from(questions)
		.orderBy(desc(questions.id))
		.limit(20);
	const recentStems = recentQuestions.map((q) => q.stem);

	// Generate questions via AI
	let round;
	try {
		round = await generateQuestions(selectedTopics, recentStems);
	} catch (e) {
		console.error('[quiz/play] Question generation failed (attempt 1):', e);
		// Retry once
		try {
			round = await generateQuestions(selectedTopics, recentStems);
		} catch (e2) {
			console.error('[quiz/play] Question generation failed (attempt 2):', e2);
			throw error(500, 'Failed to generate quiz questions. Please try again.');
		}
	}

	const displayQuestions = flattenQuestions(round);

	// Create session in DB
	const [session] = await db
		.insert(sessions)
		.values({
			topicMode: mode,
			selectedTopics: mode === 'manual' ? selectedTopics : null,
			total: displayQuestions.length
		})
		.returning({ id: sessions.id });

	// Insert questions
	for (const q of displayQuestions) {
		await db.insert(questions).values({
			sessionId: session.id,
			position: q.position,
			format: q.format,
			topic: q.topic,
			stem: q.stem,
			options: q.options ?? null,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation,
			questionData: q.questionData
		});
	}

	return {
		sessionId: session.id,
		questions: displayQuestions.map((q) => ({
			position: q.position,
			format: q.format,
			topic: q.topic,
			stem: q.stem,
			options: q.options,
			blankId: q.blankId
		}))
	};
};

export const actions: Actions = {
	submit: async ({ request }) => {
		const formData = await request.formData();
		const sessionId = Number(formData.get('sessionId'));
		if (!sessionId) throw error(400, 'Missing session ID');

		// Load questions for this session
		const sessionQuestions = await db
			.select()
			.from(questions)
			.where(eq(questions.sessionId, sessionId))
			.orderBy(questions.position);

		if (sessionQuestions.length === 0) throw error(404, 'Session not found');

		let correctCount = 0;

		for (const q of sessionQuestions) {
			const userAnswer = (formData.get(`answer_${q.position}`) as string) ?? '';

			let isCorrect: boolean;
			let aiNote: string | undefined;

			if (q.format === 'multiple_choice' || (q.format === 'cloze' && q.options)) {
				// Exact match for dropdown
				isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
			} else {
				// AI grading for free-text
				if (userAnswer.trim() === '') {
					isCorrect = false;
				} else {
					try {
						const result = await gradeAnswer(q.stem, q.correctAnswer, userAnswer);
						isCorrect = result.correct;
						aiNote = result.note ?? undefined;
					} catch (e) {
						console.error(`[quiz/play] AI grading failed for question ${q.position}:`, e);
						// Fallback to exact match
						isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
					}
				}
			}

			if (isCorrect) correctCount++;

			await db.insert(answers).values({
				questionId: q.id,
				userAnswer: userAnswer || '(no answer)',
				isCorrect,
				aiNote
			});
		}

		// Update session
		await db
			.update(sessions)
			.set({ completedAt: new Date(), score: correctCount })
			.where(eq(sessions.id, sessionId));

		throw redirect(303, `/quiz/results/${sessionId}`);
	}
};
