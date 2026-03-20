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
	<div class="flex items-center justify-between">
		<a href="/history" class="text-sm text-primary hover:underline">&larr; Back to History</a>
		<div class="text-sm text-muted">
			{new Date(data.session.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
		</div>
	</div>

	<div class="text-center">
		<div class="text-3xl font-bold {data.session.score >= 7 ? 'text-green-600' : data.session.score >= 5 ? 'text-amber-500' : 'text-red-500'}">
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
							<span>{r.topicName}</span>
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
								<div class="text-xs text-amber-600 italic">{r.aiNote}</div>
							{/if}
						</div>
						{#if !r.isCorrect}
							<div class="text-sm bg-gray-50 dark:bg-gray-800 rounded p-3 text-muted">{r.explanation}</div>
						{:else}
							<button onclick={() => toggleExplanation(r.position)} class="text-xs text-primary hover:underline">
								{expandedExplanations.has(r.position) ? 'Hide explanation' : 'Show explanation'}
							</button>
							{#if expandedExplanations.has(r.position)}
								<div class="text-sm bg-gray-50 dark:bg-gray-800 rounded p-3 text-muted">{r.explanation}</div>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
