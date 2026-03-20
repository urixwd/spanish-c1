<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let expandedExplanations = $state<Set<number>>(new Set());

	function toggleExplanation(position: number) {
		const next = new Set(expandedExplanations);
		if (next.has(position)) {
			next.delete(position);
		} else {
			next.add(position);
		}
		expandedExplanations = next;
	}
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div class="text-center space-y-2">
		<h1 class="text-2xl font-bold">Results</h1>
		<div class="text-4xl font-bold {data.session.score >= 7 ? 'text-green-600' : data.session.score >= 5 ? 'text-amber-500' : 'text-red-500'}">
			{data.session.score} / {data.session.total}
		</div>
	</div>

	<div class="space-y-4">
		{#each data.results as r}
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 space-y-3">
				<div class="flex items-start gap-3">
					<span class="text-lg mt-0.5">{r.isCorrect ? '✅' : '❌'}</span>
					<div class="flex-1 space-y-2">
						<div class="flex items-center gap-2 text-xs text-muted">
							<span>Q{r.position}</span>
							<span class="capitalize">{r.topicName}</span>
							<span class="uppercase">{r.format.replace('_', ' ')}</span>
						</div>
						<p class="text-sm leading-relaxed">{r.stem}</p>

						<div class="text-sm space-y-1">
							<div>
								<span class="text-muted">Your answer:</span>
								<span class="font-mono {r.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500'}">{r.userAnswer}</span>
							</div>
							{#if !r.isCorrect}
								<div>
									<span class="text-muted">Correct:</span>
									<span class="font-mono text-green-600 dark:text-green-400">{r.correctAnswer}</span>
								</div>
							{/if}
							{#if r.aiNote}
								<div class="text-xs text-amber-600 dark:text-amber-400 italic">{r.aiNote}</div>
							{/if}
						</div>

						{#if !r.isCorrect}
							<div class="text-sm bg-gray-50 dark:bg-gray-800 rounded p-3 text-muted">
								{r.explanation}
							</div>
						{:else}
							<button
								onclick={() => toggleExplanation(r.position)}
								class="text-xs text-primary hover:underline"
							>
								{expandedExplanations.has(r.position) ? 'Hide explanation' : 'Show explanation'}
							</button>
							{#if expandedExplanations.has(r.position)}
								<div class="text-sm bg-gray-50 dark:bg-gray-800 rounded p-3 text-muted">
									{r.explanation}
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="flex gap-4 justify-center">
		<a
			href="/quiz"
			class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
		>
			New Quiz
		</a>
		<a
			href="/"
			class="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
		>
			Back to Dashboard
		</a>
	</div>
</div>
