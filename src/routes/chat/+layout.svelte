<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import Underlined from '$lib/components/Underlined.svelte';
	import type { WritableChat } from '../+layout.svelte';
	import type { Chat } from './+layout';
	import ChatBody from './ChatBody.svelte';
	import { onDestroy } from 'svelte';
	import { getContext } from 'svelte';

	export let data;
	$: ({ supabase, user, chats: dataChats } = data);

	let chats: (Chat & { notification?: true })[] | undefined;

	$: if (dataChats) dataChatsChanged(dataChats);
	function dataChatsChanged(dataChats: Chat[]) {
		if (chats === undefined) {
			chats = JSON.parse(JSON.stringify(dataChats));
			return;
		}
		dataChats.forEach((dataChat, index) => {
			if (dataChat.id !== chats![index].id) chats!.splice(index, 1);
		});
		if (chats.length > dataChats.length) chats.splice(chats.length - 1);
	}

	const chatMessages = getContext<WritableChat>('chat');
	const unsubscribe = chatMessages.subscribe(async (event) => {
		if (
			event === null ||
			supabase === undefined ||
			event.eventType !== 'INSERT' ||
			$page.params.id === String(event.new.chat)
		)
			return;
		const chat = chats?.find((chat) => chat.id === event.new.chat);
		if (chat) {
			chat.notification = true;
			chats = chats;
			return;
		}

		const { data: newChat, error: supabaseError } = await supabase
			.from('my_chats')
			.select('id, user(id, name), offer(id, creator(id, name), hidden, title)')
			.eq('id', event.new.chat)
			.single<Chat>();
		if (supabaseError) throw supabaseError;

		(newChat as Chat & { notification?: true }).notification = true;

		if (chats === undefined) invalidate('layout:data');
		else chats = [...chats, newChat];
	});

	onDestroy(unsubscribe);
</script>

<section class="mb-4 rounded-bl-3xl">
	<h2><Underlined>Chats</Underlined></h2>
</section>

{#if user}
	<section class="h-[80vh]">
		{#if !chats || chats.length === 0}
			<div class="flex h-full flex-col items-center justify-center">
				<span class="mb-6 text-4xl">Kein Chat gefunden</span>
				Du bist momentan an keinem Chat beteiligt
				<a href="/shop" class="button mt-4">Zum Shop<iconify-icon icon="material-symbols:arrow-forward-rounded" /></a>
			</div>
		{:else}
			<ChatBody {supabase} {user} {chats}><slot /></ChatBody>
		{/if}
	</section>
{:else}
	<section class="flex h-[80vh] flex-col items-center justify-center">
		<h4 class="mb-8">Anmeldung erforderlich</h4>
		Melde dich an, um deine Chats sehen zu können:
		<a href="/register" class="button mt-4">
			Account erstellen<iconify-icon icon="material-symbols:arrow-forward-rounded" />
		</a>
		<span class="lines-green-800 my-2 w-full max-w-lg text-sm">Oder</span>
		<a href="/?login" class="button">Anmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" /></a>
	</section>
{/if}
