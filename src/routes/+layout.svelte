<script context="module" lang="ts">
	type Event =
		| {
				eventType: 'INSERT';
				new: {
					id: number;
					chat: number;
					receiver: string;
					created_at: string;
					message: string | null;
					images: string[] | null;
				};
				old: {};
		  }
		| {
				eventType: 'UPDATE';
				new: {
					id: number;
					chat: number;
					receiver: string;
					created_at: string;
					message: string | null;
					images: string[] | null;
				};
				old: { id: number };
		  }
		| {
				eventType: 'DELETE';
				new: {};
				old: { id: number };
		  }
		| null;
	export type WritableChat = Writable<Event>;
</script>

<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import '../app.css';
	import Alerts, { type Alert } from './Alerts.svelte';
	import BlockedModal from './BlockedModal.svelte';
	import Sidebar from './Sidebar.svelte';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import 'iconify-icon';
	import { onMount, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	const alerts = writable<Alert[]>([]);
	setContext('alerts', alerts);

	const chat = writable<Event>(null);
	setContext('chat', chat);

	export let data;
	$: ({ supabase, user, session } = data);

	type Block = { username: string; until: number; description: string };

	let block: Block | null = null;

	setContext('updateBlock', updateBlock);

	function updateBlock() {
		const localStorageBlock = localStorage.getItem('block');
		if (localStorageBlock === null) return;

		const parsedBlock: Block = JSON.parse(localStorageBlock);
		if (parsedBlock.until < new Date().valueOf()) localStorage.removeItem('block');
		else block = parsedBlock;
	}

	onMount(() => {
		if (typeof user?.blocked_until === 'number') {
			localStorage.setItem(
				'block',
				JSON.stringify({ username: user.name, until: user.blocked_until, description: user.block_description })
			);
			supabase.auth.signOut();
		}

		updateBlock();

		let channel: RealtimeChannel | undefined;

		const { data: authData } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
			if (newSession && channel === undefined) {
				let deleteChatCooldown = 0;

				channel = supabase
					.channel('chat')
					.on(
						'postgres_changes',
						{ event: '*', schema: 'public', table: 'messages', filter: `receiver=eq.${newSession.user.id}` },
						(payload) => {
							if (payload.errors) {
								const alertId = Symbol();
								alerts.update((oldAlerts) => [
									...oldAlerts,
									{
										id: alertId,
										color: 'red',
										icon: 'material-symbols:error-circle-rounded-outline',
										title: 'Fehler',
										description: 'Eine neue Chat-Nachricht konnte nicht geladen werden',
										action: {
											text: 'Zu deine Chats',
											function: () => {
												goto('/chat');
												alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
											}
										}
									}
								]);
							} else if ($page.url.pathname.startsWith('/chat')) {
								chat.set({ eventType: payload.eventType, new: payload.new, old: payload.old } as Event);
							} else if (payload.eventType === 'INSERT') {
								const alertId = Symbol();
								alerts.update((oldAlerts) => [
									...oldAlerts,
									{
										id: alertId,
										icon: 'material-symbols:chat-outline-rounded',
										title: 'Neue Chatnachricht',
										action: {
											text: 'Zu den Chat',
											function: () => {
												goto(`/chat/${payload.new.chat}`);
												alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
											}
										}
									}
								]);
							} else if (payload.eventType === 'UPDATE') {
								const alertId = Symbol();
								alerts.update((oldAlerts) => [
									...oldAlerts,
									{
										id: alertId,
										icon: 'material-symbols:chat-outline-rounded',
										title: 'Eine Chatnachricht wurde bearbeitet',
										action: {
											text: 'Zu den Chat',
											function: () => {
												goto(`/chat/${payload.new.chat}`);
												alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
											}
										}
									}
								]);
							} else {
								const cooldown = ++deleteChatCooldown;
								setTimeout(() => {
									if (deleteChatCooldown === cooldown) {
										deleteChatCooldown = 0;

										console.log(deleteChatCooldown);

										if (cooldown === 1) {
											const alertId = Symbol();
											alerts.update((oldAlerts) => [
												...oldAlerts,
												{
													id: alertId,
													color: 'red',
													icon: 'material-symbols:chat-outline-rounded',
													title: 'Ein Chatnachricht wurde gelöscht',
													action: {
														text: 'Zu deine Chats',
														function: () => {
															goto('/chat');
															alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
														}
													}
												}
											]);
										} else {
											const alertId = Symbol();
											alerts.update((oldAlerts) => [
												...oldAlerts,
												{
													id: alertId,
													color: 'red',
													icon: 'material-symbols:chat-outline-rounded',
													title: 'Ein Chat wurde gelöscht',
													action: {
														text: 'Zu deine Chats',
														function: () => {
															goto('/chat');
															alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
														}
													}
												}
											]);
										}
									}
								}, 200);
							}
						}
					)
					.subscribe((_, error) => {
						if (error === undefined) return;

						alerts.update((oldAlerts) => [
							...oldAlerts,
							{
								id: Symbol(),
								color: 'red',
								icon: 'material-symbols:error-circle-rounded-outline',
								title: 'Fehler',
								description:
									'Ein Verbindungsfehler ist aufgetreten. Deine Chat-Nachrichten werden dir nun nicht mehr mitgeteilt, ohne dass du die Chat-Seite neu lädst.'
							}
						]);
					});
			} else {
				channel?.unsubscribe();
			}
		});

		return () => {
			if (channel) channel.unsubscribe();
			authData.subscription.unsubscribe();
		};
	});
</script>

{#if block}
	<BlockedModal {...block} on:close={() => (block = null)} />
{/if}

<svelte:head>
	<title>OHG Second Hand</title>
	<meta name="description" content="OHG Second Hand Webseite" />
</svelte:head>

<div class="grid grid-cols-[min-content_auto] gap-4">
	<Alerts />

	<Sidebar admin={user?.admin} />

	<div>
		<main><slot /></main>

		<footer>
			<!-- <p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p> -->
			FOOTER
		</footer>
	</div>
</div>
