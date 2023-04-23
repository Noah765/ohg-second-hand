<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let value: any;
	export let selected = false;

	let parent: HTMLButtonElement;

	const context = getContext<Writable<{ html: string; value: any } | null>>('selected');

	onMount(() => {
		if (selected && !$context) context.set({ html: parent.innerHTML, value });

		const unsubscribe = context.subscribe((current) => {
			if (current?.value === value) selected = true;
			else selected = false;
		});

		return unsubscribe;
	});
</script>

<button
	role="option"
	type="button"
	bind:this={parent}
	aria-selected={selected}
	on:focus={() => context.set({ html: parent.innerHTML, value })}
	class:bg-neutral-600={selected}
	class="button-hidden w-full rounded-none border-y border-neutral-500 bg-neutral-50 px-4 py-2 first:border-t-0 last:rounded-b-2xl last:border-b-0 hover:bg-neutral-100 active:border-neutral-500 [&>*]:mx-2"
>
	<slot />
</button>
