<script lang="ts">
	let images: Blob[] = [];
	let currentImage = 1;

	async function onAppendImages(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const inputElement = event.currentTarget;

		const files = Array.from(inputElement.files!);
		if (files.length === 0) return;
		inputElement.value = '';

		// TODO: Max Image Client side limit
		// if (images.length === 10) {
		// 	useEmitter().emit('imageUploadLimit', 10);
		// 	return;
		// }
		// if (images.length + files.length > 10) {
		// 	useEmitter().emit('imageUploadLimit', 10);
		// 	files.splice(10 - images.value.length);
		// }

		const processedImages: Blob[] = [];

		const reader = new FileReader();
		for (let i = files.length - 1; i >= 0; i--) {
			// Iterate backwards to enable splicing while iterating
			if (!files[i].type.startsWith('image/')) files.splice(i, 1);

			reader.readAsArrayBuffer(files[i]);

			await new Promise<void>((resolve) => {
				reader.onload = (event) => {
					const image = new Image();
					image.src = window.URL.createObjectURL(new Blob([event.target!.result!]));

					image.onload = () => {
						const canvas = document.createElement('canvas');

						let width = image.width;
						let height = image.height;

						if (width > 600) {
							height = Math.round(height * (600 / width));
							width = 600;
						}
						if (height > 450) {
							width = Math.round(width * (450 / height));
							height = 450;
						}

						canvas.width = width;
						canvas.height = height;
						canvas.getContext('2d')!.drawImage(image, 0, 0, width, height);

						canvas.toBlob(
							(blob) => {
								processedImages.unshift(blob!);
								resolve();
							},
							'image/jpeg',
							0.5
						);
					};
				};
			});
		}

		currentImage = images.length;
		images = images.concat(processedImages);
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
			style:right={`${24.5 * currentImage}rem`}
			class="relative flex h-full transition-[right] duration-500"
		>
			{#each images as image, index}
				<span class="mr-2 flex min-w-full items-center justify-center">
					<img
						src={URL.createObjectURL(image)}
						alt={`Hinzugefügtes Bild ${index + 1}`}
						class="max-h-full rounded-3xl"
					/>
				</span>
			{/each}
		</div>
		<button
			aria-label="Bild Löschen"
			on:click={() => {
				if (currentImage >= 1) currentImage--;
				images.splice(currentImage, 1);
				images = images;
			}}
			class="button-hidden absolute left-8 top-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-600 border-opacity-0 bg-neutral-600 bg-opacity-50 p-2 hover:bg-opacity-75 active:border-0"
		>
			<iconify-icon icon="material-symbols:delete-outline-rounded" />
		</button>
		<label
			aria-label="Mehr Bilder hinzufügen"
			class="absolute right-8 top-8 flex -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border border-neutral-600 border-opacity-0 bg-neutral-600 bg-opacity-50 p-2 hover:bg-opacity-75 active:border-0"
		>
			<input type="file" accept="image/*" multiple hidden on:change={onAppendImages} />
			<iconify-icon icon="material-symbols:add-rounded" />
		</label>

		{#if currentImage !== 0}
			<button
				aria-label="Vorheriges Bild"
				on:click={() => currentImage--}
				class="button-hidden absolute left-2 top-1/2 -translate-y-1/2 rounded-2xl border border-neutral-600 border-opacity-0 bg-neutral-600 bg-opacity-50 py-2 hover:bg-opacity-75 active:border-0"
			>
				<iconify-icon icon="material-symbols:chevron-left-rounded" class="text-4xl" />
			</button>
		{/if}
		{#if currentImage !== images.length - 1}
			<button
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
						aria-label={`Zu Bild ${index + 1}`}
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
