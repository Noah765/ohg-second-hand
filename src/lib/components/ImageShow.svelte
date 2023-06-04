<script lang="ts">
	import { formatImage } from '$lib/format';

	export let images: string[] | null;
	export let height: number;
	export let width: number;

	let currentImage = 0;

	let swipeStartX: number;
	function swipeStart(event: TouchEvent) {
		if (!images) return;
		swipeStartX = event.changedTouches[0].screenX;
	}
	function swipeEnd(event: TouchEvent) {
		if (!images) return;

		const swipeEndX = event.changedTouches[0].screenX;

		if (swipeEndX < swipeStartX) {
			if (images.length !== 0 && currentImage !== images.length - 1) {
				currentImage++;
			}
		} else if (swipeEndX > swipeStartX) {
			if (currentImage !== 0) {
				currentImage--;
			}
		}
	}
</script>

{#if images}
	<div
		on:touchstart={swipeStart}
		on:touchend={swipeEnd}
		class="relative overflow-hidden rounded-3xl"
		style:height="{height}px"
		style:width="{width}px"
		style:min-width="{width}px"
	>
		<div
			role="region"
			aria-label="Bilder"
			style:right="{(width + 8) * currentImage}px"
			class="relative flex h-full transition-[right] duration-500"
		>
			{#each images as image, index}
				<span class="mr-2 flex min-w-full items-center justify-center">
					<img src={formatImage(image, 'offer_images')} alt="Bild {index + 1}" class="max-h-full rounded-3xl" />
				</span>
			{/each}
		</div>

		{#if currentImage !== 0}
			<button
				type="button"
				aria-label="Vorheriges Bild"
				on:click={() => currentImage--}
				class="button-hidden absolute left-2 top-1/2 -translate-y-1/2 rounded-2xl border border-neutral-600 border-opacity-0 bg-neutral-600 bg-opacity-50 py-2 hover:bg-opacity-75 active:border-0"
			>
				<iconify-icon icon="material-symbols:chevron-left-rounded" class="text-4xl" />
			</button>
		{/if}
		{#if currentImage !== images.length - 1}
			<button
				type="button"
				aria-label="Nächstes Bild"
				on:click={() => currentImage++}
				class="button-hidden absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl border border-neutral-600 border-opacity-0 bg-neutral-600 bg-opacity-50 py-2 hover:bg-opacity-75 active:border-0"
			>
				<iconify-icon icon="material-symbols:chevron-right-rounded" class="text-4xl" />
			</button>
		{/if}

		{#if images.length !== 1}
			<div class="absolute bottom-6 left-1/2 flex -translate-x-1/2">
				{#each images as _, index}
					<button
						type="button"
						aria-label="Zu Bild {index + 1}"
						on:click={() => (currentImage = index)}
						class:cursor-auto={index === currentImage}
						class:w-8={index === currentImage}
						class:bg-green-600={index === currentImage}
						class="button-hidden mx-2 h-4 w-4 rounded-full border-2 border-green-600 transition-all"
					/>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="rounded-3xl bg-gray-500" style:height="{height}px" style:min-width="{width}px" />
{/if}
