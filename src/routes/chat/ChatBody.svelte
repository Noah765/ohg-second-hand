<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Modal from '$lib/components/Modal.svelte';
	import type { WritableAlerts } from '../Alerts.svelte';
	import type { LayoutData } from './$types';
	import type { Chat } from './+layout';
	import AdminChatActionModal from './AdminChatActionModal.svelte';
	import ChatReportModal from './ChatReportModal.svelte';
	import { getContext } from 'svelte';
	import { onDestroy } from 'svelte';

	export let supabase: LayoutData['supabase'];
	export let user: Exclude<LayoutData['user'], null>;
	export let chats: (Chat & { notification?: true })[];

	const alerts: WritableAlerts = getContext('alerts');

	let currentChat: Chat & { notification?: true };

	const unsubscribe = page.subscribe((newData) => {
		currentChat = chats.find((chat) => String(chat.id) === newData.params.id)!;
		delete currentChat.notification;
	});

	onDestroy(unsubscribe);

	let deleteChatVerification = false;
	let deleteChatLoading = false;
	let deleteChatError = '';
	async function deleteChat() {
		deleteChatLoading = true;
		deleteChatError = '';

		const { error: supabaseError } = await supabase.from('chats').delete().eq('id', currentChat.id);

		deleteChatLoading = false;

		if (supabaseError) {
			deleteChatError = supabaseError.message;
			return;
		}

		deleteChatVerification = false;
	}

	let reportChat = false;
	let adminAction = false;

	let closeOfferVerification = false;
	let closeOfferLoading = false;
	let closeOfferError = '';
	async function toggleOfferVisibility() {
		closeOfferLoading = true;
		closeOfferError = '';

		const newHidden = !currentChat.offer.hidden;

		const { error: supabaseError } = await supabase
			.from('offers')
			.update({ hidden: newHidden })
			.eq('id', currentChat.offer.id);

		closeOfferLoading = false;

		if (supabaseError) {
			closeOfferError = supabaseError.message;
			return;
		}

		closeOfferVerification = false;
		currentChat.offer.hidden = newHidden;
	}
	async function deleteOffer() {
		closeOfferLoading = true;
		closeOfferError = '';

		const { error: supabaseError } = await supabase.from('offers').delete().eq('id', currentChat.offer.id);

		closeOfferLoading = false;

		if (supabaseError) {
			closeOfferError = supabaseError.message;
			return;
		}

		closeOfferVerification = false;

		const alertId = Symbol();
		alerts.update((oldAlerts) => [
			...oldAlerts,
			{
				id: alertId,
				color: 'red',
				icon: 'material-symbols:delete-rounded',
				title: 'Angebot gelöscht',
				action: {
					text: 'Zu deinen Angeboten',
					function: () => {
						goto('/profile/offers');
						alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
					}
				}
			}
		]);
	}
</script>

{#if deleteChatVerification}
	<Modal>
		<h5>Bestätigung erforderlich</h5>
		<iconify-icon icon="material-symbols:delete-outline-rounded" class="my-2 text-9xl text-red-700" />
		<span class="line-red-700 mb-4" />
		<p>Möchtest du diesen Chat wirklich unwiderruflich löschen?</p>
		<p class="error mt-auto">{deleteChatError}</p>
		<button
			on:click={deleteChat}
			aria-busy={deleteChatLoading}
			disabled={deleteChatLoading}
			class="button-red mb-4 mt-2"
		>
			Löschen
		</button>
		<button on:click={() => (deleteChatVerification = false)}>
			Abbrechen<iconify-icon icon="material-symbols:close-rounded" />
		</button>
	</Modal>
{/if}

{#if reportChat}
	<ChatReportModal {supabase} {user} chatId={currentChat.id} on:close={() => (reportChat = false)} />
{/if}

{#if adminAction}
	<AdminChatActionModal {user} chat={currentChat} on:close={() => (adminAction = false)} />
{/if}

{#if closeOfferVerification}
	<Modal>
		<h5>Weiteres Vorgehen</h5>
		<iconify-icon icon="material-symbols:close-rounded" class="my-2 text-9xl text-red-700" />
		<span class="line-red-700 mb-4" />
		<p>Möchtest du das Angebot löschen oder auf {currentChat.offer.hidden ? 'sichtbar' : 'unsichtbar'} stellen?</p>
		<p class="error mt-auto">{closeOfferError}</p>
		<button on:click={deleteOffer} aria-busy={closeOfferLoading} disabled={closeOfferLoading} class="button-red mt-2">
			Löschen
		</button>
		<button
			on:click={toggleOfferVisibility}
			aria-busy={closeOfferLoading}
			disabled={closeOfferLoading}
			class="mb-6 mt-3"
		>
			Auf {currentChat.offer.hidden ? 'sichtbar' : 'unsichtbar'} stellen
		</button>
		<button on:click={() => (closeOfferVerification = false)}>
			Abbrechen<iconify-icon icon="material-symbols:close-rounded" />
		</button>
	</Modal>
{/if}

<div class="flex h-full w-full">
	<div class="min-w-[30%] overflow-y-auto whitespace-nowrap p-1">
		{#each chats as chat (chat.id)}
			<a
				href="/chat/{chat.id}"
				class="relative mb-3 block cursor-pointer rounded-xl border border-transparent p-2 px-3 shadow-[0_0_0_3px_black] hover:bg-[#cacaca] active:border-black active:shadow-[0_0_0_2px_black]"
				class:bg-[#bbbbbb]={currentChat.id === chat.id}
			>
				<a href="/offers/{chat.offer.id}" class="cursor-pointer underline">
					{chat.offer.title}
				</a>
				{#if chat.offer.hidden}
					<span class="text-xl opacity-50"> (Unsichtbar)</span>
				{/if}
				<div class="text-xl">
					Chat mit
					<a
						href="/profile/{user.id === chat.offer.creator.id ? chat.user.id : chat.offer.creator.id}"
						class="underline"
					>
						{user.id === chat.offer.creator.id ? chat.user.name : chat.offer.creator.name}
					</a>
				</div>
				{#if chat.notification}
					<iconify-icon
						icon="material-symbols:mark-unread-chat-alt-outline-rounded"
						class="absolute bottom-1 right-2"
					/>
				{/if}
			</a>
		{/each}
	</div>
	<span class="mx-6 min-h-full min-w-[0.2rem] rounded-full bg-black" />
	<div class="flex w-full flex-col">
		<div class="flex flex-wrap gap-4">
			<span class="flex-1 whitespace-nowrap rounded-2xl p-2 px-4 shadow-[0_0_0_3px_black]">
				<a href="/offers/{currentChat.offer.id}" class="underline">
					{currentChat.offer.title}
				</a>
				{#if currentChat.offer.hidden}
					<span class="text-xl opacity-50"> (Unsichtbar)</span>
				{/if}
			</span>
			<button on:click={() => (deleteChatVerification = true)} class="!w-min">Chat löschen</button>
			{#if user.admin}
				<button on:click={() => (adminAction = true)} class="!w-min">Admin Aktion</button>
			{:else if currentChat.report}
				<a href="/profile?chat-reports" class="button w-min">Meldung ansehen</a>
			{:else}
				<button on:click={() => (reportChat = true)} class="!w-min">Chat melden</button>
			{/if}
			{#if currentChat.offer.creator.id === user.id}
				<button on:click={() => (closeOfferVerification = true)} class="!w-min">Abschließen</button>
			{/if}
		</div>
		<slot />
	</div>
</div>
