<script lang="ts">
	import { page } from '$app/stores';

	export let data;
</script>

<section>
	{#if data.otherUser}
		<span class="text-6xl">Profil</span>
		<div class="mb-6 mt-4 rounded-2xl border-4 border-black p-6">
			<span class="mb-10 block text-4xl">{data.otherUser.name}</span>
			{#if data.otherUserOfferCount === 0}
				<span>{data.otherUser.name} besitzt momentan keine Angebote</span>
			{:else}
				<a href="/profile/{$page.params.id}/offers" class="mt-10 block cursor-pointer text-4xl underline">
					{data.otherUserOfferCount} Angebote
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
