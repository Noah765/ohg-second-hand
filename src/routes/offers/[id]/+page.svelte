<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { formatCategory, formatPrice, formatPriceType, formatTime } from '$lib/format.js';
	import type { SubmitFunction } from './$types.js';
	import DeletionModal from './DeletionModal.svelte';

	export let data;

	let deleteModal = false;

	let bookmarkLoading = false;
	const submitBookmark: SubmitFunction = () => {
		bookmarkLoading = true;
		return async ({ update }) => {
			await update();
			bookmarkLoading = false;
		};
	};
</script>

{#if deleteModal}<DeletionModal on:close={() => (deleteModal = false)} />{/if}

{#if data.offer}
	<section class="mb-4 flex justify-between rounded-bl-3xl">
		<div>
			<div class="flex items-end">
				<span class="text-6xl">{data.offer.title}</span>
				<span>&nbsp;von&nbsp;</span>
				<a href="/profile/{data.offer.creator.id}" class="underline">{data.offer.creator.name}</a>
			</div>
			<span class="mt-1 flex h-1 rounded-full bg-green-800" />
		</div>
		<div class="flex items-center">
			{#if data.offer.hidden}<span class="opacity-50">Unsichtbar</span>{/if}
			{#if data.user?.id === data.offer.creator.id}
				<div class="ml-6 flex">
					<button on:click={() => (deleteModal = true)} class="mr-3">Löschen</button>
					<a href="/offers/{$page.params.id}/edit" class="button">Bearbeiten</a>
				</div>
			{/if}
		</div>
	</section>

	<section class="flex flex-col rounded-l-3xl">
		<div class="flex items-center">
			<div class="relative h-72 w-96 min-w-[24rem] overflow-hidden rounded-3xl bg-gray-500" />
			<span class="mx-6 h-64 w-1 rounded-full bg-black" />
			<div class="flex h-72 w-full flex-col">
				<span class="text-base">{formatTime(data.offer.created_at)}</span>
				<span class:opacity-50={!data.offer.description} class="overflow-x-hidden overflow-y-scroll overflow-ellipsis">
					{data.offer.description ?? 'Keine Beschreibung vorhanden'}
				</span>
			</div>
		</div>
		<div class="my-4 flex justify-center">
			<span class="h-1 w-[calc(100%-4rem)] rounded-full bg-green-800" />
		</div>
		<div class="mx-10 flex justify-between">
			<div class="flex items-center">
				<iconify-icon icon={formatCategory(data.offer.category).icon} />
				<span>&nbsp;({formatCategory(data.offer.category).name})</span>
			</div>
			<span class="text-3xl">{formatPrice(data.offer.price)} ({formatPriceType(data.offer.price_type)})</span>
		</div>
		<div class="mb-10 mt-4 flex justify-center">
			<span class="h-1 w-[calc(100%-4rem)] rounded-full bg-green-800" />
		</div>
		<form method="POST" action="?/bookmark" use:enhance={submitBookmark}>
			<button aria-busy={bookmarkLoading} disabled={bookmarkLoading}>
				{data.bookmark ? 'Gemerkt' : 'Merken'}
				<iconify-icon icon={data.bookmark ? 'ph:heart-fill' : 'ph:heart'} class:text-green-800={data.bookmark} />
			</button>
		</form>
		TODO: Rest of section
		<a href="/shop" class="button">Zurück zum Shop<iconify-icon icon="material-symbols:arrow-back-rounded" /></a>
	</section>
{:else}
	<section class="flex h-[80vh] flex-col items-center justify-center rounded-bl-3xl text-center">
		<span class="text-4xl">Fehler: Angebot konnte nicht geladen werden</span>
		<span>Überprüfe deine Internetverbindung und die angegebene URL</span>
	</section>
{/if}
