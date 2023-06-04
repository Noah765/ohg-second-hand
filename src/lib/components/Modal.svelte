<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	let modal: HTMLElement;
	let focusableElements: NodeListOf<HTMLElement>;

	onMount(() => {
		document.body.style.overflow = 'hidden';

		focusableElements = modal.querySelectorAll<HTMLElement>(
			'a:not([disabled]), button:not([disabled]), textarea:not([disabled]), area:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled])'
		);
	});

	onDestroy(() => {
		if (browser) document.body.style.overflow = '';
	});

	function onTab(event: KeyboardEvent) {
		const firstFocusableElement = focusableElements[0];
		const lastFocusableElement = focusableElements[focusableElements.length - 1];

		let focusCaptured = false;
		for (let i = 0; i < focusableElements.length; i++) {
			if (focusableElements[i] === document.activeElement) {
				focusCaptured = true;
				break;
			}
		}

		if (event.shiftKey && (!focusCaptured || firstFocusableElement === document.activeElement)) {
			event.preventDefault();
			lastFocusableElement.focus();
		} else if (!event.shiftKey && (!focusCaptured || lastFocusableElement === document.activeElement)) {
			event.preventDefault();
			firstFocusableElement.focus();
		}
	}
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.key === 'Tab') onTab(event);
	}}
/>

<div transition:fade={{ duration: 200 }} class="fixed bottom-0 left-0 right-0 top-0 z-30 bg-black bg-opacity-50" />
<article
	bind:this={modal}
	transition:scale
	role="dialog"
	aria-modal="true"
	class="hide-scrollbar fixed right-1/2 top-1/2 z-30 flex h-[39rem] w-full max-w-lg -translate-y-1/2 translate-x-1/2 flex-col items-center overflow-y-scroll rounded-3xl bg-neutral-50 p-8 text-center"
>
	<slot />
</article>
