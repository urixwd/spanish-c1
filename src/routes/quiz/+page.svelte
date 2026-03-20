<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let mode = $state<'adaptive' | 'manual'>('adaptive');
	let selectedTopics = $state<string[]>([]);
	let includeVocab = $state<string[]>([]);

	function toggleTopic(id: string) {
		if (selectedTopics.includes(id)) {
			selectedTopics = selectedTopics.filter((t) => t !== id);
		} else {
			selectedTopics = [...selectedTopics, id];
		}
	}

	function toggleVocab(id: string) {
		if (includeVocab.includes(id)) {
			includeVocab = includeVocab.filter((t) => t !== id);
		} else {
			includeVocab = [...includeVocab, id];
		}
	}

	const grammarTopics = $derived(data.topics.filter((t) => t.category === 'grammar'));
	const vocabTopics = $derived(data.topics.filter((t) => t.category === 'vocabulary'));

	function startUrl() {
		const params = new URLSearchParams();
		params.set('mode', mode);
		if (mode === 'manual' && selectedTopics.length > 0) {
			params.set('topics', selectedTopics.join(','));
		}
		if (includeVocab.length > 0) {
			params.set('vocab', includeVocab.join(','));
		}
		return `/quiz/play?${params.toString()}`;
	}

	const canStart = $derived(
		mode === 'adaptive' || selectedTopics.length > 0 || includeVocab.length > 0
	);
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">Start a Quiz</h1>

	<div class="space-y-4">
		<label class="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer">
			<input type="radio" name="mode" value="adaptive" bind:group={mode} class="accent-primary" />
			<div>
				<div class="font-semibold">Let AI pick my weak areas</div>
				<div class="text-sm text-muted">Grammar topics selected based on your lowest accuracy</div>
			</div>
		</label>

		<label class="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer">
			<input type="radio" name="mode" value="manual" bind:group={mode} class="accent-primary" />
			<div>
				<div class="font-semibold">Choose topics manually</div>
				<div class="text-sm text-muted">Select specific grammar areas to practice</div>
			</div>
		</label>
	</div>

	{#if mode === 'manual'}
		<div>
			<h2 class="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Grammar</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
				{#each grammarTopics as topic}
					<button
						onclick={() => toggleTopic(topic.id)}
						class="text-left p-3 rounded-lg border transition-colors {selectedTopics.includes(topic.id) ? 'border-primary bg-red-50 dark:bg-red-950' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}"
					>
						<div class="font-medium text-sm">{topic.name}</div>
						<div class="text-xs text-muted">{topic.description}</div>
						{#if topic.accuracy !== null}
							<div class="text-xs mt-1 font-mono {topic.accuracy < 50 ? 'text-red-500' : topic.accuracy < 75 ? 'text-amber-500' : 'text-green-500'}">
								{topic.accuracy}% ({topic.total} attempts)
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Vocab topics always shown as opt-in -->
	<div>
		<h2 class="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Vocabulary & Culture (optional)</h2>
		<p class="text-xs text-muted mb-2">These are not part of standard C1 grammar — select to include in your quiz.</p>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
			{#each vocabTopics as topic}
				<button
					onclick={() => toggleVocab(topic.id)}
					class="text-left p-3 rounded-lg border transition-colors {includeVocab.includes(topic.id) ? 'border-amber-500 bg-amber-50 dark:bg-amber-950' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}"
				>
					<div class="font-medium text-sm">{topic.name}</div>
					<div class="text-xs text-muted">{topic.description}</div>
					{#if topic.accuracy !== null}
						<div class="text-xs mt-1 font-mono {topic.accuracy < 50 ? 'text-red-500' : topic.accuracy < 75 ? 'text-amber-500' : 'text-green-500'}">
							{topic.accuracy}% ({topic.total} attempts)
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<a
		href={startUrl()}
		class="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors {!canStart ? 'opacity-50 pointer-events-none' : ''}"
	>
		Start
	</a>
</div>
