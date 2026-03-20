<script lang="ts">
	import type { PageData } from './$types';
	import BarChart from '$lib/components/BarChart.svelte';
	import TrendChart from '$lib/components/TrendChart.svelte';

	let { data }: { data: PageData } = $props();

	const topicsWithData = $derived(data.byTopic.filter((t) => t.total > 0));
	const formatLabels: Record<string, string> = {
		multiple_choice: 'Multiple Choice',
		fill_in_blank: 'Fill in Blank',
		cloze: 'Cloze'
	};
</script>

<div class="space-y-8">
	<h1 class="text-2xl font-bold">Statistics</h1>

	{#if data.totalAnswers === 0}
		<p class="text-muted">No data yet. Complete a quiz to see your statistics.</p>
	{:else}
		<!-- Totals -->
		<div class="grid grid-cols-2 gap-4">
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
				<div class="text-sm text-muted">Total Questions Answered</div>
				<div class="text-2xl font-bold">{data.totalAnswers}</div>
			</div>
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
				<div class="text-sm text-muted">Completed Sessions</div>
				<div class="text-2xl font-bold">{data.totalSessions}</div>
			</div>
		</div>

		<!-- Accuracy by topic -->
		{#if topicsWithData.length > 0}
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
				<h2 class="text-lg font-semibold mb-4">Accuracy by Topic</h2>
				<BarChart
					labels={topicsWithData.map((t) => t.name)}
					values={topicsWithData.map((t) => t.accuracy)}
				/>
				<div class="mt-4 space-y-2">
					{#each topicsWithData as t}
						<div class="flex items-center justify-between text-sm">
							<span>{t.name}</span>
							<span class="font-mono">{t.accuracy}% <span class="text-muted">({t.total})</span></span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Accuracy by format -->
		{#if data.byFormat.length > 0}
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
				<h2 class="text-lg font-semibold mb-4">Accuracy by Format</h2>
				<div class="space-y-3">
					{#each data.byFormat as f}
						<div class="flex items-center justify-between">
							<span>{formatLabels[f.format] ?? f.format}</span>
							<div class="flex items-center gap-3">
								<div class="w-32 bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
									<div class="bg-primary h-2.5 rounded-full" style="width: {f.accuracy}%"></div>
								</div>
								<span class="text-sm font-mono w-16 text-right">{f.accuracy}%</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Weekly trend -->
		{#if data.trend.length > 0}
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
				<h2 class="text-lg font-semibold mb-4">Weekly Trend</h2>
				<TrendChart data={data.trend.map((t) => ({ date: t.week, accuracy: t.accuracy }))} />
			</div>
		{/if}
	{/if}
</div>
