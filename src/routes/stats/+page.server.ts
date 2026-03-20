import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessions, questions, answers } from '$lib/server/db/schema';
import { sql, eq, isNotNull } from 'drizzle-orm';
import { topics, topicIds, type TopicId } from '$lib/topics';

export const load: PageServerLoad = async () => {
	// Accuracy by topic
	const topicStats = await db
		.select({
			topic: questions.topic,
			total: sql<number>`count(*)`,
			correct: sql<number>`sum(case when ${answers.isCorrect} then 1 else 0 end)`
		})
		.from(questions)
		.innerJoin(answers, eq(answers.questionId, questions.id))
		.groupBy(questions.topic);

	const byTopic = topicIds.map((id) => {
		const s = topicStats.find((t) => t.topic === id);
		return {
			topic: id,
			name: topics[id].name,
			total: s ? Number(s.total) : 0,
			correct: s ? Number(s.correct ?? 0) : 0,
			accuracy: s && s.total > 0 ? Math.round(((s.correct ?? 0) / Number(s.total)) * 100) : 0
		};
	});

	// Accuracy by format
	const formatStats = await db
		.select({
			format: questions.format,
			total: sql<number>`count(*)`,
			correct: sql<number>`sum(case when ${answers.isCorrect} then 1 else 0 end)`
		})
		.from(questions)
		.innerJoin(answers, eq(answers.questionId, questions.id))
		.groupBy(questions.format);

	const byFormat = formatStats.map((f) => ({
		format: f.format,
		total: Number(f.total),
		correct: Number(f.correct ?? 0),
		accuracy: f.total > 0 ? Math.round(((f.correct ?? 0) / Number(f.total)) * 100) : 0
	}));

	// Weekly trend (last 12 weeks)
	const weeklyTrend = await db
		.select({
			week: sql<string>`to_char(date_trunc('week', ${answers.answeredAt}), 'YYYY-MM-DD')`,
			total: sql<number>`count(*)`,
			correct: sql<number>`sum(case when ${answers.isCorrect} then 1 else 0 end)`
		})
		.from(answers)
		.groupBy(sql`date_trunc('week', ${answers.answeredAt})`)
		.orderBy(sql`date_trunc('week', ${answers.answeredAt})`)
		.limit(12);

	const trend = weeklyTrend.map((w) => ({
		week: w.week,
		accuracy: w.total > 0 ? Math.round(((w.correct ?? 0) / Number(w.total)) * 100) : 0
	}));

	// Totals
	const [totals] = await db
		.select({
			totalAnswers: sql<number>`count(*)`,
			totalSessions: sql<number>`(select count(*) from ${sessions} where ${sessions.completedAt} is not null)`
		})
		.from(answers);

	return {
		byTopic,
		byFormat,
		trend,
		totalAnswers: Number(totals.totalAnswers),
		totalSessions: Number(totals.totalSessions)
	};
};
