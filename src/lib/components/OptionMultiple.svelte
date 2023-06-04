<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let value: any;
	export let selected = false;

	let parent: HTMLSpanElement;

	const context = getContext<Writable<{ html: string; value: any }[] | null>>('selected');

	onMount(() => {
		if (selected && !$context) {
			setTimeout(() => {
				context.update((old) => {
					if (!old) old = [];
					old.push({ html: parent.innerHTML, value });
					old.sort();
					return old;
				});
			});
		}

		const unsubscribe = context.subscribe((current) => {
			if ((current ?? []).find((e) => e.value === value)) selected = true;
			else selected = false;
		});

		return unsubscribe;
	});

	function change() {
		if (($context ?? []).find((e) => e.value === value)) {
			context.update((old) => old!.filter((e) => e.value !== value));
		} else {
			context.update((old) => {
				if (!old) old = [];
				old.push({ html: parent.innerHTML, value });
				old.sort();
				return old;
			});
		}
	}
</script>

<label
	class="group flex cursor-pointer border-y border-neutral-500 bg-neutral-50 px-4 py-2 first:border-t-0 last:rounded-b-2xl last:border-b-0 hover:bg-neutral-100"
>
	<input
		type="checkbox"
		role="option"
		aria-selected={selected}
		aria-checked={selected}
		checked={selected}
		on:change={change}
		class="peer mr-4 h-9 w-9 rounded-lg border-black shadow-3 group-active:border group-active:shadow-2"
	/>
	<iconify-icon
		icon="material-symbols:check-small-rounded"
		class="absolute text-4xl text-transparent transition-colors peer-checked:text-black"
	/>
	<span bind:this={parent} class="flex items-center [&>*]:ml-2"><slot /></span>
</label>
