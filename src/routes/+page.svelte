<script lang="ts">
	import type { PageData } from './$types';
	import TrendChart from '$lib/components/TrendChart.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	{#if data.totalQuizzes === 0}
		<div class="text-center py-16">
			<h1 class="text-3xl font-bold mb-4">Welcome to C1 Spanish Grammar Trainer</h1>
			<p class="text-muted mb-8">Practice C1-level Spanish grammar with AI-generated quizzes.</p>
			<a
				href="/quiz"
				class="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
			>
				Start Your First Quiz
			</a>
		</div>
	{:else}
		<h1 class="text-2xl font-bold">Dashboard</h1>

		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
				<div class="text-sm text-muted mb-1">Quizzes Taken</div>
				<div class="text-3xl font-bold">{data.totalQuizzes}</div>
			</div>
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
				<div class="text-sm text-muted mb-1">Overall Accuracy</div>
				<div class="text-3xl font-bold">{data.overallAccuracy}%</div>
			</div>
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
				<div class="text-sm text-muted mb-1">Day Streak</div>
				<div class="text-3xl font-bold">{data.streak}</div>
			</div>
		</div>

		{#if data.trend.length > 0}
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
				<h2 class="text-lg font-semibold mb-4">Accuracy — Last 30 Days</h2>
				<TrendChart data={data.trend} />
			</div>
		{/if}

		{#if data.weakestTopics.length > 0}
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
				<h2 class="text-lg font-semibold mb-4">Weakest Topics</h2>
				<div class="space-y-3">
					{#each data.weakestTopics as topic}
						<div class="flex items-center justify-between">
							<span>{topic.name}</span>
							<span class="text-sm font-mono {topic.accuracy < 50 ? 'text-red-500' : 'text-amber-500'}">{topic.accuracy}%</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="text-center">
			<a
				href="/quiz"
				class="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
			>
				Start Quiz
			</a>
		</div>
	{/if}
</div>
