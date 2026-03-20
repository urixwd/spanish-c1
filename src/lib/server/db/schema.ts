import { pgTable, serial, integer, text, boolean, timestamp, varchar, jsonb, index } from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
	id: serial('id').primaryKey(),
	startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
	completedAt: timestamp('completed_at', { withTimezone: true }),
	topicMode: varchar('topic_mode', { length: 20 }).notNull(),
	selectedTopics: text('selected_topics').array(),
	score: integer('score'),
	total: integer('total').notNull().default(10)
}, (table) => [
	index('idx_sessions_started_at').on(table.startedAt)
]);

export const questions = pgTable('questions', {
	id: serial('id').primaryKey(),
	sessionId: integer('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
	position: integer('position').notNull(),
	format: varchar('format', { length: 20 }).notNull(),
	topic: varchar('topic', { length: 50 }).notNull(),
	stem: text('stem').notNull(),
	options: jsonb('options'),
	correctAnswer: text('correct_answer').notNull(),
	explanation: text('explanation').notNull(),
	questionData: jsonb('question_data').notNull()
}, (table) => [
	index('idx_questions_session_id').on(table.sessionId),
	index('idx_questions_topic').on(table.topic)
]);

export const answers = pgTable('answers', {
	id: serial('id').primaryKey(),
	questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
	userAnswer: text('user_answer').notNull(),
	isCorrect: boolean('is_correct').notNull(),
	aiNote: text('ai_note'),
	answeredAt: timestamp('answered_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
	index('idx_answers_question_id').on(table.questionId),
	index('idx_answers_is_correct').on(table.isCorrect)
]);
