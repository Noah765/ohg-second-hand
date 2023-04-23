<script context="module" lang="ts">
	import type { Writable } from 'svelte/store';

	export type AlertsType = {
		id: symbol;
		color?: 'red' | 'green';
		icon: string;
		title: string;
		description?: string;
		action?: { text: string; function: () => void };
	}[];
	export type WritableAlerts = Writable<AlertsType>;
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';

	const data: WritableAlerts = getContext('alerts');

	function removeAlert(index: number) {
		data.update((alerts) => {
			alerts.splice(index, 1);
			return alerts;
		});
	}
</script>

<div class="fixed right-2 top-2 z-20 grid w-[32rem] gap-2">
	{#each $data as { id, color, icon, title, description, action }, index (id)}
		<article
			role="alert"
			animate:flip={{ delay: 200 }}
			out:fly={{ x: 400 }}
			class:bg-red-700={color === 'red'}
			class="relative flex items-center rounded-2xl bg-green-700 p-4 text-white"
		>
			<iconify-icon {icon} class="text-5xl" />
			<span class="line-vertical-white ml-3 mr-4" />
			<div>
				<h5>{title}</h5>
				<p class="text-base">
					{description ?? ''}
					<button on:click={action?.function} class="button-hidden inline underline">{action?.text}</button>
				</p>
			</div>
			<button
				aria-label="Schließen"
				on:click={() => removeAlert(index)}
				class="button-hidden absolute bottom-3 right-3"
			>
				<iconify-icon icon="material-symbols:close-rounded" />
			</button>
		</article>
	{/each}
</div>
