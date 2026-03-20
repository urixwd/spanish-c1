import type { TopicId } from './topics';

export interface MultipleChoiceQuestion {
	format: 'multiple_choice';
	topic: TopicId;
	stem: string;
	options: string[];
	correct_answer: string;
	explanation: string;
}

export interface FillInBlankQuestion {
	format: 'fill_in_blank';
	topic: TopicId;
	stem: string;
	correct_answer: string;
	acceptable_answers?: string[];
	explanation: string;
}

export interface ClozeBlank {
	id: number;
	type: 'free' | 'dropdown';
	options?: string[];
	correct_answer: string;
	explanation: string;
}

export interface ClozeQuestion {
	format: 'cloze';
	topic: TopicId;
	passage: string;
	blanks: ClozeBlank[];
}

export type GeneratedQuestion = MultipleChoiceQuestion | FillInBlankQuestion | ClozeQuestion;

export interface QuizRound {
	questions: GeneratedQuestion[];
}

// Flattened question for display (cloze blanks become individual items)
export interface DisplayQuestion {
	position: number; // 1-10
	format: 'multiple_choice' | 'fill_in_blank' | 'cloze';
	topic: TopicId;
	stem: string; // sentence or passage
	options?: string[]; // for MC or dropdown cloze
	blankId?: number; // for cloze blanks
	correctAnswer: string;
	explanation: string;
	questionData: GeneratedQuestion; // full original
}

export interface UserAnswer {
	position: number;
	answer: string;
}

export interface GradedAnswer {
	position: number;
	userAnswer: string;
	correctAnswer: string;
	isCorrect: boolean;
	aiNote?: string;
	explanation: string;
	stem: string;
	format: string;
	topic: TopicId;
	options?: string[];
}

export interface DashboardStats {
	totalQuizzes: number;
	overallAccuracy: number;
	streak: number;
	trend: { date: string; accuracy: number }[];
	weakestTopics: { topic: TopicId; name: string; accuracy: number }[];
}

export interface SessionSummary {
	id: number;
	startedAt: string;
	completedAt: string | null;
	score: number | null;
	total: number;
	topicMode: string;
	selectedTopics: string[] | null;
}

export interface TopicStat {
	topic: TopicId;
	name: string;
	total: number;
	correct: number;
	accuracy: number;
}
