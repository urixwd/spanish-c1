<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js';

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

	let { data }: { data: { date: string; accuracy: number }[] } = $props();
	let canvas: HTMLCanvasElement;
	let chart: Chart | undefined;

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: data.map((d) => d.date.slice(5)), // MM-DD
				datasets: [
					{
						label: 'Accuracy %',
						data: data.map((d) => d.accuracy),
						borderColor: '#b91c1c',
						backgroundColor: 'rgba(185, 28, 28, 0.1)',
						fill: true,
						tension: 0.3,
						pointRadius: 3
					}
				]
			},
			options: {
				responsive: true,
				scales: {
					y: { min: 0, max: 100, ticks: { callback: (v) => v + '%' } }
				},
				plugins: {
					tooltip: { callbacks: { label: (ctx) => ctx.parsed.y + '%' } }
				}
			}
		});

		return () => chart?.destroy();
	});
</script>

<div class="w-full" style="height: 250px;">
	<canvas bind:this={canvas}></canvas>
</div>
