<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ImageShow from '$lib/components/ImageShow.svelte';
	import { formatCategory, formatPrice, formatPriceFixed, formatTime } from '$lib/format.js';
	import AdminOfferActionModal from './AdminOfferActionModal.svelte';
	import DeletionModal from './DeletionModal.svelte';
	import OfferReportModal from './OfferReportModal.svelte';
	import type { PostgrestError } from '@supabase/supabase-js';

	export let data;
	$: ({ supabase, offer, user } = data);

	let adminActionModal = false;
	let deleteModal = false;

	let createChatLoading = false;
	let createChatError = '';
	let createChatMessage: string;
	async function createChat() {
		if (!createChatMessage || !user || !offer) return;

		createChatLoading = true;

		const { error: insertChatError } = await supabase.from('chats').insert({ user: user.id, offer: offer.id });
		if (insertChatError) {
			createChatLoading = false;
			createChatError = insertChatError.message;
			return;
		}

		const { error: selectChatError, data: chats } = await supabase
			.from('my_chats')
			.select('id')
			.eq('user', user.id)
			.eq('offer', offer.id)
			.single<{ id: number }>();
		if (selectChatError) {
			createChatLoading = false;
			createChatError = selectChatError.message;
			return;
		}

		const { error: insertMessageError } = await supabase
			.from('messages')
			.insert({ chat: chats.id, sender: user.id, receiver: offer.creator.id, message: createChatMessage });
		if (insertMessageError) {
			createChatLoading = false;
			createChatError = insertMessageError.message;
			return;
		}

		goto(`/chat/${chats.id}`);
	}

	let bookmarkLoading = false;
	let bookmarkError = '';
	async function bookmark() {
		if (!offer || !user) return;

		bookmarkLoading = true;
		bookmarkError = '';

		let error: PostgrestError | null;
		if (offer.bookmark) {
			const { error: supabaseError } = await supabase.from('bookmarks').delete().eq('offer', offer.id);
			error = supabaseError;
		} else {
			const { error: supabaseError } = await supabase.from('bookmarks').insert({ user: user.id, offer: offer.id });
			error = supabaseError;
		}

		bookmarkLoading = false;
		if (error) bookmarkError = error.message;
		else offer.bookmark = !offer.bookmark;
	}

	let reportModal = false;
</script>

{#if offer}
	{#if adminActionModal}<AdminOfferActionModal {offer} on:close={() => (adminActionModal = false)} />{/if}
	{#if deleteModal}<DeletionModal {supabase} offerId={offer.id} on:close={() => (deleteModal = false)} />{/if}
	{#if reportModal}<OfferReportModal {supabase} {user} offerId={offer.id} on:close={() => (reportModal = false)} />{/if}

	<section class="mb-4 flex justify-between rounded-bl-3xl">
		<div>
			<div class="flex items-end">
				<span class="text-6xl">{offer.title}</span>
				<span>&nbsp;von&nbsp;</span>
				<a href="/profile/{offer.creator.id}" class="whitespace-nowrap underline">{offer.creator.name}</a>
				{#if offer.creator.blocked}<span class="text-red-700">&nbsp;(blockiert)</span>{/if}
			</div>
			<span class="mt-1 flex h-1 rounded-full bg-green-800" />
		</div>
		<div class="flex items-center">
			{#if offer.hidden}<span class="opacity-50">Unsichtbar</span>{/if}
			{#if user?.id === offer.creator.id}
				<div class="ml-6 flex">
					<button on:click={() => (deleteModal = true)} class="mr-3">Löschen</button>
					<a href="/offers/{$page.params.id}/edit" class="button">Bearbeiten</a>
				</div>
			{:else if user?.admin}
				<button on:click={() => (adminActionModal = true)} class="ml-6">Admin Aktion</button>
			{/if}
		</div>
	</section>

	<section class="flex flex-col rounded-l-3xl">
		<div class="flex items-center">
			<ImageShow images={offer.images} height={288} width={384} />
			<span class="mx-6 h-64 w-1 rounded-full bg-black" />
			<div class="flex h-72 w-full flex-col">
				<span class="text-base">{formatTime(offer.created_at)}</span>
				<span
					class:opacity-50={!offer.description}
					class="overflow-y-auto overflow-x-hidden overflow-ellipsis whitespace-pre-line"
				>
					{offer.description ?? 'Keine Beschreibung vorhanden'}
				</span>
			</div>
		</div>
		<div class="my-4 flex justify-center">
			<span class="h-1 w-full rounded-full bg-green-800" />
		</div>
		<div class="flex justify-between">
			<div class="flex items-center">
				<iconify-icon icon={formatCategory(offer.category).icon} />
				<span>&nbsp;({formatCategory(offer.category).name})</span>
			</div>
			<span class="text-3xl">{formatPrice(offer.price)} ({formatPriceFixed(offer.price_fixed)})</span>
		</div>
		<div class="mb-12 mt-4 flex justify-center">
			<span class="h-1 w-full rounded-full bg-green-800" />
		</div>
		{#if user?.id === offer.creator.id}
			{#if offer.chat_id}
				<a href="/chat/{offer.chat_id}" class="button">
					Zu deinen Chats<iconify-icon icon="material-symbols:arrow-forward-rounded" />
				</a>
			{:else}
				<span class="flex rounded-2xl border-[3px] border-black p-4 text-xl">
					Dich hat noch niemand für dieses Angebot angeschrieben
				</span>
			{/if}
		{:else if user?.id}
			{#if offer.chat_id}
				<a href="/chat/{offer.chat_id}" class="button">
					Zum Chat<iconify-icon icon="material-symbols:arrow-forward-rounded" />
				</a>
			{:else}
				<div class="flex flex-col rounded-2xl border-[3px] border-black p-4 text-xl">
					Interessiert? Fange ein Gespräch an...
					{#if createChatLoading}
						<span class="mt-3 text-3xl">Laden...</span>
					{:else if createChatError}
						<span class="error mt-3 text-2xl">Fehler: {createChatError}</span>
					{:else}
						<form on:submit|preventDefault={createChat} class="mt-3 flex">
							<input
								type="text"
								bind:value={createChatMessage}
								placeholder="Schreibe hier..."
								class="min-w-[calc(100%-6rem)]"
							/>
							<button class="ml-4 !w-min !px-6"><iconify-icon icon="prime:send" /></button>
						</form>
					{/if}
				</div>
			{/if}
			<button on:click={bookmark} aria-busy={bookmarkLoading} disabled={bookmarkLoading} class="mt-4">
				{offer.bookmark ? 'Gemerkt' : 'Merken'}
				<iconify-icon icon={offer.bookmark ? 'ph:heart-fill' : 'ph:heart'} class:text-green-800={offer.bookmark} />
			</button>
			<p class="error">{bookmarkError}</p>
			{#if !user.admin}
				{#if offer.report}
					<a href="/profile?offer-reports" class="button mt-4">Meldung ansehen</a>
				{:else}
					<button on:click={() => (reportModal = true)} class="mt-4">
						Melden<iconify-icon icon="material-symbols:flag-outline-rounded" />
					</button>
				{/if}
			{/if}
		{:else}
			Melde dich an, um mit der Erstellerin / dem Ersteller dieses Angebotes zu schreiben:
			<div class="mt-2 flex flex-col">
				<a href="/register" class="button mt-4">
					Account erstellen<iconify-icon icon="material-symbols:arrow-forward-rounded" />
				</a>
				<span class="lines-green-800 my-2 w-full max-w-lg text-sm">Oder</span>
				<a href="/?login" class="button">Anmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" /></a>
			</div>
		{/if}
		<span class="line-green-800 mb-4 mt-12 max-w-[40rem]" />
		<a href="/shop" class="button">Zurück zum Shop<iconify-icon icon="material-symbols:arrow-back-rounded" /></a>
	</section>
{:else}
	<section class="flex h-[80vh] flex-col items-center justify-center rounded-bl-3xl text-center">
		<span class="text-4xl">Fehler: Angebot konnte nicht geladen werden</span>
		<span>Überprüfe deine Internetverbindung und die angegebene URL</span>
	</section>
{/if}
