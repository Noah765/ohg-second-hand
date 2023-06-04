<script lang="ts">
	import appendImages from '$lib/appendImages';
	import { formatImage } from '$lib/format';
	import type { WritableAlerts } from '../../routes/Alerts.svelte';
	import { getContext } from 'svelte';

	export let images: (Blob | string)[] = [];
	let currentImage = 0;

	const alerts: WritableAlerts = getContext('alerts');

	async function onAppendImages(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const result = await appendImages(event, images, alerts, 10);
		if (!result) return;

		currentImage = images.length;
		images = result;
	}

	let swipeStartX: number;
	function swipeStart(event: TouchEvent) {
		swipeStartX = event.changedTouches[0].screenX;
	}
	function swipeEnd(event: TouchEvent) {
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

<div
	on:touchstart={swipeStart}
	on:touchend={swipeEnd}
	class:bg-gray-500={images.length === 0}
	class="relative h-72 w-96 min-w-[24rem] overflow-hidden rounded-3xl"
>
	{#if images.length === 0}
		<label
			class="absolute flex h-full w-full cursor-pointer flex-col items-center justify-center hover:text-neutral-800"
		>
			<input
				type="file"
				accept="image/*"
				role="button"
				aria-label="Bilder hinzufügen"
				multiple
				hidden
				on:change={onAppendImages}
			/>
			<iconify-icon icon="material-symbols:add-rounded" />
			Bilder hinzufügen
		</label>
	{:else}
		<div
			role="region"
			aria-label="Hinzugefügte Bilder"
			style:right="{24.5 * currentImage}rem"
			class="relative flex h-full transition-[right] duration-500"
		>
			{#each images as image, index (image)}
				<span class="mr-2 flex min-w-full items-center justify-center">
					<img
						src={typeof image === 'string' ? formatImage(image, 'offer_images') : URL.createObjectURL(image)}
						alt="Hinzugefügtes Bild {index + 1}"
						class="max-h-full rounded-3xl"
					/>
				</span>
			{/each}
		</div>
		<button
			type="button"
			aria-label="Bild Löschen"
			on:click={() => {
				images.splice(currentImage, 1);
				if (currentImage >= 1) currentImage--;
				images = images;
			}}
			class="button-hidden absolute left-8 top-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-600 border-opacity-0 bg-neutral-600 bg-opacity-50 p-2 hover:bg-opacity-75 active:border-0"
		>
			<iconify-icon icon="material-symbols:delete-outline-rounded" />
		</button>
		{#if images.length < 10}
			<label
				aria-label="Mehr Bilder hinzufügen"
				class="absolute right-8 top-8 flex -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border border-neutral-600 border-opacity-0 bg-neutral-600 bg-opacity-50 p-2 hover:bg-opacity-75 active:border-0"
			>
				<input type="file" accept="image/*" multiple hidden on:change={onAppendImages} />
				<iconify-icon icon="material-symbols:add-rounded" />
			</label>
		{/if}

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
	{/if}
</div>
