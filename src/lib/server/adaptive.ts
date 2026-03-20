import { db } from './db';
import { questions, answers } from './db/schema';
import { sql, eq, gte } from 'drizzle-orm';
import { grammarTopicIds, type TopicId } from '$lib/topics';

export async function selectAdaptiveTopics(): Promise<TopicId[]> {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const stats = await db
		.select({
			topic: questions.topic,
			total: sql<number>`count(*)`,
			correct: sql<number>`sum(case when ${answers.isCorrect} then 1 else 0 end)`
		})
		.from(questions)
		.innerJoin(answers, eq(answers.questionId, questions.id))
		.where(gte(answers.answeredAt, thirtyDaysAgo))
		.groupBy(questions.topic);

	const topicMap = new Map<string, { total: number; correct: number; accuracy: number }>();
	for (const s of stats) {
		const accuracy = s.total > 0 ? (s.correct ?? 0) / s.total : 0;
		topicMap.set(s.topic, { total: s.total, correct: s.correct ?? 0, accuracy });
	}

	// Sort topics: lowest accuracy first, then least practiced, then unpracticed
	const sorted = [...grammarTopicIds].sort((a, b) => {
		const sa = topicMap.get(a);
		const sb = topicMap.get(b);
		if (!sa && !sb) return 0;
		if (!sa) return -1; // unpracticed first
		if (!sb) return 1;
		if (sa.accuracy !== sb.accuracy) return sa.accuracy - sb.accuracy;
		return sa.total - sb.total;
	});

	// 60% weak (top 3), 20% medium (next 3), 20% random
	const weak = sorted.slice(0, 3);
	const medium = sorted.slice(3, 6);
	const rest = sorted.slice(6);
	const random = rest.length > 0 ? [rest[Math.floor(Math.random() * rest.length)]] : [];

	const selected = [...new Set([...weak, ...medium, ...random])];
	return selected.length > 0 ? selected : grammarTopicIds.slice(0, 5);
}
