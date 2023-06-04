<script lang="ts">
	import { page } from '$app/stores';
	import OfferListItem from '$lib/components/OfferListItem.svelte';

	export let data;
	$: ({ offers, otherUser } = data);
</script>

<section>
	{#if otherUser}
		<span class="text-6xl">{otherUser.name}s Angebote</span>
		<div class="mb-6 mt-4 rounded-2xl border-4 border-black p-6">
			<span class="text-4xl">{otherUser.name}</span>
			<a href="/profile/{$page.params.id}" class="button mt-4">
				Zurück zum Profil<iconify-icon icon="material-symbols:arrow-back-rounded" />
			</a>
		</div>
		<div class="rounded-2xl border-4 border-black p-6">
			<span class="mb-4 ml-2 flex text-3xl">Angebote</span>
			{#each offers as offer}
				<OfferListItem {offer} />
			{:else}
				{otherUser.name} besitzt momentan keine Angebote
			{/each}
		</div>
	{:else}
		<div class="flex h-[80vh] flex-col items-center justify-center">
			<span class="text-4xl">Fehler: Angebote konnte nicht geladen werden</span>
			<span>Überprüfe die angegebene URL</span>
		</div>
	{/if}
</section>
