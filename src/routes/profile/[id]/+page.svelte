<script lang="ts">
	import { page } from '$app/stores';
	import { formatReportTime } from '$lib/format.js';
	import AdminProfileActionModal from './AdminProfileActionModal.svelte';

	export let data;
	$: ({ user, otherUser, otherUserOfferCount } = data);

	let adminActionModal = false;
</script>

{#if adminActionModal}
	<AdminProfileActionModal userId={$page.params.id} on:close={() => (adminActionModal = false)} />
{/if}

<section>
	{#if otherUser}
		<span class="text-6xl">Profil</span>
		<div class="mb-6 mt-4 rounded-2xl border-4 border-black p-6">
			<span class="block text-4xl">{otherUser.name}</span>
			{#if otherUser.blocked_until}
				<div class="opacity-50">
					{otherUser.blocked_until < 4733510400000
						? `Bis zum ${formatReportTime(otherUser.blocked_until)} blockiert`
						: 'Dauerhaft blockiert'}
					<br />
					Begründung:
					<p class="text-xl">{otherUser.block_description}</p>
				</div>
			{/if}
			{#if user?.admin}
				<button class="mt-4" on:click={() => (adminActionModal = true)}>Admin Aktion</button>
			{/if}
			{#if otherUserOfferCount === 0}
				<span class="mt-10 block">{otherUser.name} besitzt momentan keine Angebote</span>
			{:else}
				<a href="/profile/{$page.params.id}/offers" class="mt-10 block text-4xl underline">
					{otherUserOfferCount} Angebot{otherUserOfferCount === 1 ? '' : 'e'}
				</a>
			{/if}
		</div>
	{:else}
		<div class="flex h-[80vh] flex-col items-center justify-center">
			<span class="text-4xl">Fehler: Profil konnte nicht geladen werden</span>
			<span>Überprüfe die angegebene URL</span>
		</div>
	{/if}
</section>
