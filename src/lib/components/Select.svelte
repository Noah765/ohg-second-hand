<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import type { TransitionConfig } from 'svelte/transition';

	export let placeholder = '';
	export let name = '';
	export let multiple = false;
	export let multipleValueRegex: RegExp | null = null;
	export let required = false;

	export let value: any = null;

	$: if (multiple)
		value =
			(selected as { value: any }[] | null)
				?.map((e) => e.value)
				.sort()
				.join('-') ?? null;
	else value = (selected as { value: any } | null)?.value ?? null;

	let expanded = false;

	const selectedContext = setContext(
		'selected',
		multiple
			? writable<{ html: string; value: any }[] | null>(null)
			: writable<{ html: string; value: any } | null>(null)
	);
	let selected:
		| {
				html: string;
				value: any;
		  }[]
		| {
				html: string;
				value: any;
		  }
		| null = null;
	onMount(() => {
		return selectedContext.subscribe((newSelected) => {
			if (!Array.isArray(newSelected) || multipleValueRegex === null) {
				selected = newSelected;
				return;
			}

			const value = newSelected
				.map((e) => e.value)
				.sort()
				.join('-');
			const replaced = value.replaceAll(multipleValueRegex, '');

			if (replaced === value) {
				selected = newSelected;
				return;
			}

			const result: { html: string; value: any }[] = [];
			newSelected.forEach((e) => {
				if (replaced.includes(e.value)) {
					result.push(e);
				}
			});

			selected = result;
		});
	});

	function scale(node: Element, { delay = 0, duration = 400, easing = cubicOut } = {}): TransitionConfig {
		const height = node.clientHeight + 3;

		return {
			delay,
			duration,
			easing,
			css: (_, u) => `transform: translateY(-${u * height}px);`
		};
	}
</script>

<div class="relative w-full max-w-lg">
	<input {name} {required} {value} aria-hidden="true" class="pointer-events-none absolute opacity-0" />
	<button
		role="combobox"
		type="button"
		aria-expanded={expanded}
		aria-controls="options"
		on:click={() => (expanded = !expanded)}
		on:blur={() => (multiple ? undefined : setTimeout(() => (expanded = false), 100))}
		class:!rounded-b-none={expanded}
		class:transition-[border-radius]={!expanded}
		class:duration-150={!expanded}
		class:delay-[260ms]={!expanded}
		class="!h-[50px] active:!border-transparent active:!shadow-3"
	>
		<span class="!ml-0 flex w-full items-center overflow-hidden [&>*]:ml-2 [&>*]:!w-min">
			{#if selected && (!Array.isArray(selected) || selected.length > 0)}
				{#if Array.isArray(selected)}
					{@html selected.map((e) => e.html).join(', ')}
				{:else}
					{@html selected.html}
				{/if}
			{:else}
				<span class="!ml-0 opacity-50">{placeholder}</span>
			{/if}
		</span>
		<iconify-icon
			icon={expanded ? 'material-symbols:keyboard-arrow-up-rounded' : 'material-symbols:keyboard-arrow-down-rounded'}
			class="!w-min"
		/>
	</button>
	<div class="absolute top-[53px] z-10 w-full max-w-lg overflow-y-clip pb-1">
		{#key expanded}
			<ul id="options" transition:scale|local class:hidden={!expanded} class="rounded-b-2xl shadow-3">
				<slot />
			</ul>
		{/key}
	</div>
</div>
