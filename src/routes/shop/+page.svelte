<script lang="ts">
	import { page as pageStore } from '$app/stores';
	import Option from '$lib/components/Option.svelte';
	import OptionMultiple from '$lib/components/OptionMultiple.svelte';
	import Select from '$lib/components/Select.svelte';
	import Underlined from '$lib/components/Underlined.svelte';
	import { formatCategory, formatPrice, formatPriceType, formatTime } from '$lib/format.js';

	export let data;

	$: url = $pageStore.url;

	$: page = Number(url.searchParams.get('page') ?? 1);

	$: pageCount = Math.ceil(data.count / 10);

	function getPageUrl(page: number) {
		const urlCopy = new URL(url.href);
		urlCopy.searchParams.set('page', String(page));
		return urlCopy.href;
	}
</script>

<section>
	<h2><Underlined>Second Hand</Underlined></h2>
	<form class="mt-6 grid max-w-[65rem] gap-3">
		<input name="q" type="search" value={url.searchParams.get('q')} placeholder="Suche" />
		<div class="grid grid-cols-[repeat(auto-fit,minmax(25rem,1fr))] gap-x-4 gap-y-3">
			<div>
				Sortieren nach:
				<Select name="sort">
					<Option
						value="created_at-DESC"
						selected={!url.searchParams.get('sort') || url.searchParams.get('sort') === 'created_at-DESC'}
					>
						Erstellungsdatum (absteigend)
					</Option>
					<Option value="created_at-ASC" selected={url.searchParams.get('sort') === 'created_at-ASC'}>
						Erstellungsdatum (aufsteigend)
					</Option>
					<Option value="price-ASC" selected={url.searchParams.get('sort') === 'price-ASC'}>Preis (aufsteigend)</Option>
					<Option value="price-DESC" selected={url.searchParams.get('sort') === 'price-DESC'}>
						Preis (absteigend)
					</Option>
					<Option value="title-ASC" selected={url.searchParams.get('sort') === 'title-ASC'}>
						Alphabetisch (aufsteigend)
					</Option>
					<Option value="title-DESC" selected={url.searchParams.get('sort') === 'title-DESC'}>
						Alphabetisch (absteigend)
					</Option>
				</Select>
			</div>
			<div>
				Kategorien:
				<Select name="categories" multiple placeholder="Nicht filtern">
					{#each Array(9) as _, category}
						<OptionMultiple value={category} selected={url.searchParams.get('categories')?.includes(String(category))}>
							{formatCategory(category).name}<iconify-icon icon={formatCategory(category).icon} />
						</OptionMultiple>
					{/each}
				</Select>
			</div>
		</div>
		<button class="mt-4 !max-w-xs text-xl">
			Angebote filtern<iconify-icon icon="material-symbols:filter-alt-outline" class="text-green-700" />
		</button>
	</form>
</section>

<section class="rounded-l-3xl">
	{#if page > 1}
		<div class="mb-4 rounded-2xl p-4 text-lg shadow-[0_0_0_3px_black]">
			Seite {page} von {pageCount} ({data.count} Angebote)
		</div>
	{/if}

	{#each data.offers as offer}
		<!-- TODO: Clean up CSS + Add semantics -->
		<a
			href={`/offers/${offer.id}`}
			class="flex items-center rounded-3xl border-2 border-transparent p-4 shadow-3 hover:bg-neutral-100 active:border-black active:shadow-1 [&:not(:last-child)]:mb-6"
		>
			<span class="h-48 min-w-[16rem] rounded-3xl bg-gray-500" />
			<span class="mx-6 h-44 min-w-[0.2rem] rounded-full bg-black" />
			<div class="flex h-48 w-full flex-col overflow-hidden">
				<div class="flex items-end whitespace-nowrap">
					<span class="overflow-hidden overflow-ellipsis text-4xl">{offer.title}</span>
					<span class="text-lg">&nbsp;von&nbsp;</span>
					<a href={`/profile/${offer.creator.id}`} class="text-lg underline">{offer.creator.name}</a>
				</div>
				<span class="mb-auto overflow-hidden text-xl">{offer.description ?? ''}</span>
				<span class="text-sm">{formatTime(offer.created_at)}</span>
				<div class="flex max-w-full items-center justify-between">
					<span> {formatPrice(offer.price)} ({formatPriceType(offer.price_type)}) </span>
					<iconify-icon icon={formatCategory(offer.category).icon} />
				</div>
			</div>
		</a>
	{:else}
		<span class="opacity-50">Keine passenden Angebote gefunden</span>
	{/each}

	{#if pageCount > 1}
		<div class="mb-4 rounded-2xl p-4 text-lg shadow-[0_0_0_3px_black]">
			Seiten:
			{#if page > 3}
				<a href={getPageUrl(1)} class="underline">1</a>&nbsp;
			{/if}
			{#if page > 2}
				<a href={getPageUrl(page - 2)} class="underline">{page - 2}</a>
			{/if}
			{#if page > 1}
				<a href={getPageUrl(page - 1)} class="underline">{page - 1}</a>&nbsp;
			{/if}
			{page}
			{#if page < pageCount}
				&nbsp;<a href={getPageUrl(page + 1)} class="underline">{page + 1}</a>
			{/if}
			{#if page < pageCount - 1}
				<a href={getPageUrl(page + 2)} class="underline">{page + 2}</a>
			{/if}
			{#if page < pageCount - 2}
				&nbsp;<a href={getPageUrl(pageCount)} class="underline">{pageCount}</a>
			{/if}
			({data.count} Angebote)
		</div>
	{/if}
</section>
