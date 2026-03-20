<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">History</h1>

	{#if data.sessions.length === 0}
		<p class="text-muted">No completed quizzes yet.</p>
	{:else}
		<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-gray-200 dark:border-gray-800 text-left">
						<th class="p-3 font-medium">Date</th>
						<th class="p-3 font-medium">Score</th>
						<th class="p-3 font-medium">Mode</th>
						<th class="p-3 font-medium">Topics</th>
						<th class="p-3"></th>
					</tr>
				</thead>
				<tbody>
					{#each data.sessions as session}
						<tr class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
							<td class="p-3">{formatDate(session.completedAt ?? session.startedAt)}</td>
							<td class="p-3 font-mono {(session.score ?? 0) >= 7 ? 'text-green-600' : (session.score ?? 0) >= 5 ? 'text-amber-500' : 'text-red-500'}">
								{session.score}/{session.total}
							</td>
							<td class="p-3 capitalize">{session.topicMode}</td>
							<td class="p-3 text-muted text-xs">
								{session.selectedTopics?.join(', ') ?? 'AI selected'}
							</td>
							<td class="p-3">
								<a href="/history/{session.id}" class="text-primary hover:underline text-xs">Review</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if data.totalPages > 1}
			<div class="flex justify-center gap-2">
				{#if data.page > 1}
					<a href="/history?page={data.page - 1}" class="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">Prev</a>
				{/if}
				<span class="px-3 py-1 text-muted">{data.page} / {data.totalPages}</span>
				{#if data.page < data.totalPages}
					<a href="/history?page={data.page + 1}" class="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">Next</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>
