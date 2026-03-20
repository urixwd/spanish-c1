import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessions, questions, answers } from '$lib/server/db/schema';
import { sql, eq, gte, isNotNull, desc } from 'drizzle-orm';
import { topics, type TopicId } from '$lib/topics';
import type { DashboardStats } from '$lib/types';

export const load: PageServerLoad = async () => {
	// Total completed quizzes
	const [{ count: totalQuizzes }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(sessions)
		.where(isNotNull(sessions.completedAt));

	// Overall accuracy
	const [accuracyResult] = await db
		.select({
			total: sql<number>`count(*)`,
			correct: sql<number>`sum(case when ${answers.isCorrect} then 1 else 0 end)`
		})
		.from(answers);

	const overallAccuracy =
		accuracyResult.total > 0
			? Math.round(((accuracyResult.correct ?? 0) / accuracyResult.total) * 100)
			: 0;

	// Streak calculation
	const completedDays = await db
		.selectDistinct({
			day: sql<string>`date(${sessions.completedAt} AT TIME ZONE 'UTC')`
		})
		.from(sessions)
		.where(isNotNull(sessions.completedAt))
		.orderBy(desc(sql`date(${sessions.completedAt} AT TIME ZONE 'UTC')`));

	let streak = 0;
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	for (let i = 0; i < completedDays.length; i++) {
		const expected = new Date(today);
		expected.setDate(expected.getDate() - i);
		const expectedStr = expected.toISOString().split('T')[0];
		if (completedDays[i].day === expectedStr) {
			streak++;
		} else {
			break;
		}
	}

	// 30-day accuracy trend
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const trendData = await db
		.select({
			day: sql<string>`date(${answers.answeredAt} AT TIME ZONE 'UTC')`,
			total: sql<number>`count(*)`,
			correct: sql<number>`sum(case when ${answers.isCorrect} then 1 else 0 end)`
		})
		.from(answers)
		.where(gte(answers.answeredAt, thirtyDaysAgo))
		.groupBy(sql`date(${answers.answeredAt} AT TIME ZONE 'UTC')`)
		.orderBy(sql`date(${answers.answeredAt} AT TIME ZONE 'UTC')`);

	const trend = trendData.map((d) => ({
		date: d.day,
		accuracy: d.total > 0 ? Math.round(((d.correct ?? 0) / d.total) * 100) : 0
	}));

	// Weakest 3 topics (min 5 answers)
	const topicStats = await db
		.select({
			topic: questions.topic,
			total: sql<number>`count(*)`,
			correct: sql<number>`sum(case when ${answers.isCorrect} then 1 else 0 end)`
		})
		.from(questions)
		.innerJoin(answers, eq(answers.questionId, questions.id))
		.groupBy(questions.topic)
		.having(sql`count(*) >= 5`);

	const weakest = topicStats
		.map((t) => ({
			topic: t.topic as TopicId,
			name: topics[t.topic as TopicId]?.name ?? t.topic,
			accuracy: t.total > 0 ? Math.round(((t.correct ?? 0) / t.total) * 100) : 0
		}))
		.sort((a, b) => a.accuracy - b.accuracy)
		.slice(0, 3);

	return {
		totalQuizzes: Number(totalQuizzes),
		overallAccuracy,
		streak,
		trend,
		weakestTopics: weakest
	} satisfies DashboardStats;
};
