<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import appendImages from '$lib/appendImages';
	import { formatImage, formatTime } from '$lib/format';
	import type { WritableChat } from '../../+layout.svelte';
	import type { WritableAlerts } from '../../Alerts.svelte';
	import type { PageData } from './$types';
	import type { Message } from './+page';
	import { getContext, onDestroy, onMount } from 'svelte';

	enum MessageStatus {
		pending,
		error
	}

	export let data: {
		supabase: PageData['supabase'];
		user: Exclude<PageData['user'], null>;
		chats: Exclude<PageData['chats'], undefined>;
		messages: (PageData['messages'][number] & { status?: MessageStatus })[];
	};
	$: ({ supabase, user, chats, messages } = data);

	onDestroy(() => {
		unsubscribeChatMessages();
		clearInterval(sendMessageCooldownTimer);
	});

	onMount(async () => await supabase.rpc('update_message_seen', { chat: $page.params.id }));

	$: currentChat = chats.find((chat) => String(chat.id) === $page.params.id)!;

	let scrollingElement: HTMLDivElement;

	const alerts: WritableAlerts = getContext('alerts');

	// If a chat gets deleted that is not selected, every message in it would trigger a refetch of layout:data, so the chats
	let refetchChatCooldown = 0;

	const chatMessages = getContext<WritableChat>('chat');
	const unsubscribeChatMessages = chatMessages.subscribe(async (event) => {
		if (event === null) return;

		if (event.eventType === 'INSERT' && currentChat && event.new.chat === currentChat.id) {
			messages.unshift({
				id: event.new.id,
				receiver: event.new.receiver,
				created_at: event.new.created_at,
				message: event.new.message,
				images: event.new.images
			});
			messages = messages;
			scrollingElement.scrollTo(0, 0);
			await supabase.rpc('update_message_seen', { chat: currentChat.id.toString() });
		} else if (event.eventType === 'UPDATE' && event.new.chat === currentChat.id) {
			const message = messages.find((message) => message.id === event.new.id);
			if (message) {
				message.message = event.new.message;
				message.images = event.new.images;
				messages = messages;
			}
		} else if (event.eventType === 'DELETE') {
			if (!messages) return;
			const message = messages.find((message) => message.id === event.old.id);

			if (message === undefined || (messages.length === 1 && message !== undefined)) {
				const coolDown = ++refetchChatCooldown;
				setTimeout(() => {
					if (refetchChatCooldown === coolDown) {
						refetchChatCooldown = 0;
						invalidate('layout:data');
					}
				}, 500);
				return;
			}

			messages.splice(messages.indexOf(message), 1);
			messages = messages;

			if (messages.length < 10 && !fullyLoaded) loadMore();
		}
	});

	let section = 0;
	let loadingMore = false;
	let loadMoreError = '';
	let fullyLoaded = data.messages.length < 10;
	async function onScroll(event: UIEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (
			fullyLoaded ||
			loadingMore ||
			loadMoreError ||
			event.currentTarget.scrollTop + event.currentTarget.scrollHeight > event.currentTarget.offsetHeight + 100
		) {
			return;
		}

		loadMore();
	}
	async function loadMore() {
		loadingMore = true;
		section++;

		const sectionOffset = messages.length - section * 10;
		const { data, error } = await supabase
			.from('messages')
			.select('id, receiver, created_at, message, images')
			.eq('chat', currentChat.id)
			.order('created_at', { ascending: false })
			.range(section * 10 + sectionOffset, section * 10 + 9 + sectionOffset)
			.returns<Message[]>();

		loadingMore = false;

		if (error) {
			loadMoreError = error.message;
			return;
		}

		if (data.length < 10) fullyLoaded = true;
		messages.push(...data);
		messages = messages;
	}

	export let images: Blob[] = [];
	async function onAppendImages(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const result = (await appendImages(event, images, alerts, 5)) as Blob[] | undefined;
		if (result) images = result;
	}

	let message: string;
	let sendMessageLoading = false;
	let sendMessageCooldown = 0;
	let sendMessageCooldownTimer: NodeJS.Timeout;
	let sendMessageError = '';
	async function sendMessage() {
		if (!message && images.length === 0) return;

		sendMessageLoading = true;
		sendMessageCooldown = 5;
		sendMessageCooldownTimer = setInterval(() => {
			sendMessageCooldown--;
			if (sendMessageCooldown === 0) clearInterval(sendMessageCooldownTimer);
		}, 1000);
		sendMessageError = '';

		const promises = images.map((image) => supabase.storage.from('message_images').upload(crypto.randomUUID(), image));
		const results = await Promise.all(promises);

		const imageUrls: string[] = [];
		for (const { data, error } of results) {
			if (error) {
				sendMessageError = error.message;
				return;
			} else imageUrls.push(data.path);
		}

		const receiver = user.id === currentChat.offer.creator.id ? currentChat.user.id : currentChat.offer.creator.id;

		const { error: insertError } = await supabase.from('messages').insert({
			chat: currentChat.id,
			sender: user.id,
			receiver,
			message: message ? message : null,
			images: imageUrls.length === 0 ? null : imageUrls
		});
		if (insertError) {
			sendMessageLoading = false;
			sendMessageError = insertError.message;
			return;
		}

		const { error: selectError, data: newMessage } = await supabase
			.from('messages')
			.select('id, created_at')
			.eq('chat', currentChat.id)
			.eq('receiver', receiver)
			.order('created_at', { ascending: false })
			.limit(1)
			.single<{ id: number; created_at: string }>();

		sendMessageLoading = false;

		if (selectError) {
			sendMessageError = selectError.message;
			return;
		}

		messages.unshift({
			id: newMessage.id,
			receiver,
			created_at: newMessage.created_at,
			message: message ? message : null,
			images: imageUrls.length === 0 ? null : imageUrls
		});
		messages = messages;
		scrollingElement.scrollTo(0, 0);
		message = '';
		images = [];
	}

	let messageEditId: number | null = null;
	let messageEditText: string | null;
	let messageEditTextInput: HTMLInputElement;
	let messageEditImages: (string | Blob)[] = [];
	function startEdit(id: number, message: string | null, images: string[] | null) {
		messageEditId = id;
		messageEditText = message;
		if (images) messageEditImages = JSON.parse(JSON.stringify(images));
		setTimeout(() => messageEditTextInput.focus());
	}
	async function onAppendEditImages(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const result = (await appendImages(event, messageEditImages, alerts, 5)) as Blob[] | undefined;
		if (result) messageEditImages = result;
	}
	async function editMessage() {
		const message = messages.find((message) => message.id === messageEditId)!;
		messageEditId = null;

		if (messageEditText === message.message && messageEditImages === message.images) return;

		message.status = MessageStatus.pending;

		const promises: Promise<{ error: {} | null }>[] = [];
		messageEditImages.forEach((image, index) => {
			if (typeof image === 'string') return;
			const uuid = crypto.randomUUID();
			messageEditImages[index] = uuid;
			promises.push(supabase.storage.from('message_images').upload(uuid, image));
		});
		const results = await Promise.all(promises);

		for (const { error: supabaseError } of results) {
			if (supabaseError) {
				message.status = MessageStatus.error;
				return;
			}
		}

		const { error } = await supabase
			.from('messages')
			.update({
				message: messageEditText ? messageEditText : null,
				images: messageEditImages.length === 0 ? null : (messageEditImages as string[])
			})
			.eq('id', message.id);
		if (error) {
			message.status = MessageStatus.error;
			return;
		}

		message.status = undefined;
		message.message = messageEditText;
		message.images = messageEditImages as string[];

		messages = messages;
	}

	async function deleteMessage(id: number) {
		const message = messages.find((message) => message.id === id);
		if (!message) return;

		message.status = MessageStatus.pending;

		const { error } = await supabase.from('messages').delete().eq('id', id);

		if (error) {
			message.status = MessageStatus.error;
			return;
		}
	}
</script>

<div class="fade relative my-2 h-full overflow-hidden">
	<div bind:this={scrollingElement} on:scroll={onScroll} class="flex h-full flex-col-reverse overflow-y-auto">
		{#each messages as { id, receiver, created_at, message, images, status } (id)}
			<div class:ml-auto={receiver !== user.id} class="flex w-[30vw] flex-col">
				{#if status === MessageStatus.pending}
					<div class="text-sm">Speichern...</div>
				{:else if status === MessageStatus.error}
					<div class="text-sm text-red-700">Fehler, nicht gespeichert</div>
				{:else}
					<div class="flex text-sm">
						{formatTime(created_at)}
						{#if messageEditId === id}
							|&nbsp;
							<button class="button-hidden" on:click={() => (messageEditId = null)}>Abbrechen</button>
							&nbsp;|&nbsp;
							<button class="button-hidden" on:click={() => editMessage()}>Speichern</button>
						{:else if receiver !== user.id}
							|&nbsp;
							<button class="button-hidden" on:click={() => startEdit(id, message, images)}>Bearbeiten</button>
							&nbsp;|&nbsp;
							<button class="button-hidden" on:click={() => deleteMessage(id)}>Löschen</button>
						{/if}
					</div>
				{/if}
				{#if messageEditId === id}
					<div
						class="mb-4 flex flex-col items-center rounded-xl border-[3px] border-black bg-neutral-600 p-2 px-4 focus-within:bg-neutral-100"
					>
						<form on:submit|preventDefault={editMessage} class="w-full">
							<input
								type="text"
								class="min-w-full rounded-none p-0 shadow-none"
								placeholder="Nachricht..."
								bind:value={messageEditText}
								bind:this={messageEditTextInput}
							/>
						</form>
						<div class="flex w-full flex-col">
							{#each messageEditImages as image, index}
								<div class="relative my-1">
									<img
										src={typeof image === 'string' ? formatImage(image, 'message_images') : URL.createObjectURL(image)}
										alt="Bild {index + 1} der Nachricht"
										class="w-full rounded-2xl"
									/>
									<button
										on:click={() => {
											messageEditImages.splice(index, 1);
											messageEditImages = messageEditImages;
										}}
										class="button-hidden"
									>
										<iconify-icon
											icon="material-symbols:delete-outline-rounded"
											class="absolute bottom-2 right-2 h-8 w-8 cursor-pointer text-red-600"
										/>
									</button>
								</div>
							{/each}
						</div>
						<label class="cursor-pointer">
							<input type="file" accept="image/*" multiple hidden on:change={onAppendEditImages} />
							<iconify-icon icon="material-symbols:add-rounded" />
						</label>
					</div>
				{:else}
					<div
						class:!bg-neutral-600={receiver !== user.id}
						class="mb-4 flex flex-col rounded-xl border-[3px] border-black bg-neutral-100 p-2 px-4"
					>
						{message ?? ''}
						{#if images}
							{#each images as image, index}
								<img
									src={formatImage(image, 'message_images')}
									alt="Bild {index + 1} der Nachricht"
									class="my-1 rounded-2xl"
								/>
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		{/each}
		{#if loadingMore}
			<span class="mb-6 mt-2 flex justify-center text-xl opacity-50">Laden...</span>
		{:else if loadMoreError}
			<span class="mb-6 mt-2 flex justify-center text-xl text-red-700">Fehler beim Laden: {loadMoreError}</span>
		{/if}
	</div>
</div>
{#if images.length > 0}
	<div class="mb-4 flex flex-wrap rounded-2xl bg-[#cacaca] p-2 shadow-[0_0_0_3px_black]">
		{#each images as image, index (index)}
			<div class="relative m-0.5 h-14">
				<img src={URL.createObjectURL(image)} alt="Hinzugefügtes Bild {index + 1}" class="h-full rounded-xl" />
				<button
					on:click={() => {
						images.splice(index, 1);
						images = images;
					}}
					class="button-hidden absolute bottom-1 right-1 h-5 w-5"
				>
					<iconify-icon icon="material-symbols:delete-outline-rounded" class="text-2xl text-red-600" />
				</button>
			</div>
		{/each}
	</div>
{/if}
<p class="error">{sendMessageError}</p>
<form on:submit|preventDefault={sendMessage} class="flex">
	<input type="text" bind:value={message} placeholder="Schreibe hier..." class="min-w-[calc(100%-12rem)]" />
	<label class="button ml-4 cursor-pointer px-6">
		<input type="file" accept="image/*" multiple hidden on:change={onAppendImages} />
		<iconify-icon icon="iconoir:add-media-image" />
	</label>
	<button
		aria-label="Nachricht senden"
		disabled={sendMessageLoading || sendMessageCooldown !== 0}
		aria-busy={sendMessageLoading}
		class="ml-4 !h-12 justify-center !px-6 before:!mr-0"
	>
		{#if !sendMessageLoading}
			{#if sendMessageCooldown === 0}
				<iconify-icon icon="prime:send" />
			{:else}
				{sendMessageCooldown}
			{/if}
		{/if}
	</button>
</form>

<style>
	.fade:before {
		content: '';
		width: 100%;
		height: 100%;
		position: absolute;
		z-index: 1;
		background: linear-gradient(#d9d9d9, transparent 3%, transparent 97%, #d9d9d9);
		pointer-events: none;
	}
</style>
