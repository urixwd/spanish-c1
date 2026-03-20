<script lang="ts">
	import type { PageData } from './$types';
	import { topics } from '$lib/topics';

	let { data }: { data: PageData } = $props();
	let current = $state(0);
	// svelte-ignore state_referenced_locally
	let userAnswers = $state<string[]>(Array.from({ length: data.questions.length }, () => ''));
	let submitting = $state(false);

	const q = $derived(data.questions[current]);
	const total = $derived(data.questions.length);

	// Group cloze questions by passage
	const clozePassages = $derived.by(() => {
		const map = new Map<string, number[]>();
		for (let i = 0; i < data.questions.length; i++) {
			const q = data.questions[i];
			if (q.format === 'cloze') {
				const existing = map.get(q.stem) ?? [];
				existing.push(i);
				map.set(q.stem, existing);
			}
		}
		return map;
	});

	function isClozeGroupStart(idx: number) {
		for (const indices of clozePassages.values()) {
			if (indices[0] === idx) return true;
		}
		return false;
	}

	function getClozeIndices(stem: string) {
		return clozePassages.get(stem) ?? [];
	}

	function renderClozePassage(passage: string, indices: number[]) {
		// Replace ___(N) with blank indicators
		let rendered = passage;
		for (const idx of indices) {
			const blankId = data.questions[idx].blankId;
			if (blankId !== undefined) {
				rendered = rendered.replace(`___(${blankId})`, `[Blank ${blankId}]`);
			}
		}
		return rendered;
	}
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Progress -->
	<div class="flex items-center justify-between text-sm text-muted">
		<span>Question {current + 1} / {total}</span>
		<span class="capitalize">{topics[q.topic as keyof typeof topics]?.name ?? q.topic}</span>
	</div>
	<div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
		<div class="bg-primary h-2 rounded-full transition-all" style="width: {((current + 1) / total) * 100}%"></div>
	</div>

	<!-- Question -->
	<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
		{#if q.format === 'cloze'}
			{#if isClozeGroupStart(current)}
				<p class="text-sm font-semibold text-muted uppercase tracking-wide">Cloze Passage</p>
				<p class="text-lg leading-relaxed italic">{renderClozePassage(q.stem, getClozeIndices(q.stem))}</p>
			{/if}
			<p class="font-medium">Blank {q.blankId}:</p>
			{#if q.options && q.options.length > 0}
				<select
					bind:value={userAnswers[current]}
					class="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono"
				>
					<option value="">— Select —</option>
					{#each q.options as opt}
						<option value={opt}>{opt}</option>
					{/each}
				</select>
			{:else}
				<input
					type="text"
					bind:value={userAnswers[current]}
					placeholder="Type your answer..."
					class="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono"
				/>
			{/if}
		{:else if q.format === 'multiple_choice'}
			<p class="text-lg leading-relaxed">{q.stem}</p>
			<select
				bind:value={userAnswers[current]}
				class="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono"
			>
				<option value="">— Select —</option>
				{#each q.options ?? [] as opt}
					<option value={opt}>{opt}</option>
				{/each}
			</select>
		{:else}
			<p class="text-lg leading-relaxed">{q.stem}</p>
			<input
				type="text"
				bind:value={userAnswers[current]}
				placeholder="Type your answer..."
				class="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono"
			/>
		{/if}
	</div>

	<!-- Navigation -->
	<div class="flex items-center justify-between">
		<button
			onclick={() => current = Math.max(0, current - 1)}
			disabled={current === 0}
			class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
		>
			Previous
		</button>

		{#if current < total - 1}
			<button
				onclick={() => current = current + 1}
				class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
			>
				Next
			</button>
		{:else}
			<form method="POST" action="?/submit" onsubmit={() => submitting = true}>
				<input type="hidden" name="sessionId" value={data.sessionId} />
				{#each userAnswers as answer, i}
					<input type="hidden" name="answer_{i + 1}" value={answer} />
				{/each}
				<button
					type="submit"
					disabled={submitting}
					class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
				>
					{submitting ? 'Grading...' : 'Submit'}
				</button>
			</form>
		{/if}
	</div>

	<!-- Answer overview dots -->
	<div class="flex gap-1.5 justify-center flex-wrap">
		{#each data.questions as _, i}
			<button
				onclick={() => current = i}
				class="w-8 h-8 rounded-full text-xs font-mono border transition-colors
					{i === current ? 'bg-primary text-white border-primary' :
					userAnswers[i] ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700' :
					'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'}"
			>
				{i + 1}
			</button>
		{/each}
	</div>
</div>
