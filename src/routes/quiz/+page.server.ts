import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { questions, answers } from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';
import { topics, topicIds, type TopicId } from '$lib/topics';

export const load: PageServerLoad = async () => {
	// Get topic stats for the picker
	const stats = await db
		.select({
			topic: questions.topic,
			total: sql<number>`count(*)`,
			correct: sql<number>`sum(case when ${answers.isCorrect} then 1 else 0 end)`
		})
		.from(questions)
		.innerJoin(answers, eq(answers.questionId, questions.id))
		.groupBy(questions.topic);

	const topicMap = new Map(stats.map((s) => [s.topic, s]));

	const topicList = topicIds.map((id) => {
		const s = topicMap.get(id);
		return {
			id,
			name: topics[id].name,
			description: topics[id].description,
			category: topics[id].category,
			total: s ? Number(s.total) : 0,
			accuracy: s && s.total > 0 ? Math.round(((s.correct ?? 0) / Number(s.total)) * 100) : null
		};
	});

	return { topics: topicList };
};
