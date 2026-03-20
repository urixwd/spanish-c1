<script lang="ts">
	import '../app.css';

	let { children } = $props();
	let dark = $state(false);

	function toggleDark() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
	}
</script>

<div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
	<nav class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
		<div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
			<a href="/" class="text-xl font-bold text-primary">C1 Spanish</a>
			<div class="flex items-center gap-4">
				<a href="/" class="text-sm hover:text-primary transition-colors">Dashboard</a>
				<a href="/quiz" class="text-sm hover:text-primary transition-colors">Quiz</a>
				<a href="/stats" class="text-sm hover:text-primary transition-colors">Statistics</a>
				<a href="/history" class="text-sm hover:text-primary transition-colors">History</a>
				<button onclick={toggleDark} class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
					{dark ? 'Light' : 'Dark'}
				</button>
			</div>
		</div>
	</nav>

	<main class="max-w-5xl mx-auto px-4 py-8">
		{@render children()}
	</main>
</div>
