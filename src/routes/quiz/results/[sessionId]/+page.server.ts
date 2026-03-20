import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessions, questions, answers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { topics, type TopicId } from '$lib/topics';

export const load: PageServerLoad = async ({ params }) => {
	const sessionId = Number(params.sessionId);
	if (!sessionId) throw error(400, 'Invalid session ID');

	const [session] = await db
		.select()
		.from(sessions)
		.where(eq(sessions.id, sessionId));

	if (!session) throw error(404, 'Session not found');
	if (!session.completedAt) throw error(400, 'Session not yet completed');

	const sessionQuestions = await db
		.select()
		.from(questions)
		.where(eq(questions.sessionId, sessionId))
		.orderBy(questions.position);

	const results = [];
	for (const q of sessionQuestions) {
		const [answer] = await db
			.select()
			.from(answers)
			.where(eq(answers.questionId, q.id));

		results.push({
			position: q.position,
			format: q.format,
			topic: q.topic as TopicId,
			topicName: topics[q.topic as TopicId]?.name ?? q.topic,
			stem: q.stem,
			options: q.options as string[] | null,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation,
			userAnswer: answer?.userAnswer ?? '',
			isCorrect: answer?.isCorrect ?? false,
			aiNote: answer?.aiNote
		});
	}

	return {
		session: {
			id: session.id,
			score: session.score ?? 0,
			total: session.total,
			startedAt: session.startedAt.toISOString(),
			completedAt: session.completedAt.toISOString()
		},
		results
	};
};
