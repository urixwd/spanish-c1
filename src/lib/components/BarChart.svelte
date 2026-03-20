<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';

	Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip);

	let { labels, values, label = 'Accuracy %' }: { labels: string[]; values: number[]; label?: string } = $props();
	let canvas: HTMLCanvasElement;
	let chart: Chart | undefined;

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label,
						data: values,
						backgroundColor: 'rgba(185, 28, 28, 0.7)',
						borderRadius: 4
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

<div class="w-full" style="height: 300px;">
	<canvas bind:this={canvas}></canvas>
</div>
