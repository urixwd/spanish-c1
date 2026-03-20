import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { isNotNull, desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
	const perPage = 20;
	const offset = (page - 1) * perPage;

	const [{ count }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(sessions)
		.where(isNotNull(sessions.completedAt));

	const rows = await db
		.select()
		.from(sessions)
		.where(isNotNull(sessions.completedAt))
		.orderBy(desc(sessions.completedAt))
		.limit(perPage)
		.offset(offset);

	return {
		sessions: rows.map((s) => ({
			id: s.id,
			startedAt: s.startedAt.toISOString(),
			completedAt: s.completedAt?.toISOString() ?? null,
			score: s.score,
			total: s.total,
			topicMode: s.topicMode,
			selectedTopics: s.selectedTopics
		})),
		page,
		totalPages: Math.ceil(Number(count) / perPage)
	};
};
