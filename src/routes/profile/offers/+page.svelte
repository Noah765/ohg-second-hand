<script lang="ts">
	import OfferListItem from '$lib/components/OfferListItem.svelte';

	export let data;
	$: ({ offers, user } = data);
</script>

<section>
	{#if !user || !offers}
		<div class="flex flex-col">
			<h3 class="mb-4">Anmeldung erforderlich</h3>
			Melde dich an, um deine Angebote zu sehen:
			<a href="/register" class="button mt-4">
				Account erstellen<iconify-icon icon="material-symbols:arrow-forward-rounded" />
			</a>
			<span class="lines-green-800 my-2 w-full max-w-lg text-sm">Oder</span>
			<a href="/?login" class="button">Anmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" /></a>
		</div>
	{:else}
		<span class="text-6xl">Deine Angebote</span>
		<div class="mb-6 mt-4 rounded-2xl border-4 border-black p-6">
			<span class="text-4xl">{user.name}</span>
			<a href="/profile" class="button mt-4">
				Zurück zum Profil<iconify-icon icon="material-symbols:arrow-back-rounded" />
			</a>
		</div>
		<div class="rounded-2xl border-4 border-black p-6">
			<span class="mb-4 ml-2 flex text-3xl">Angebote</span>
			{#each offers as offer}
				<OfferListItem {offer} />
			{:else}
				Du besitzt momentan keine Angebote
			{/each}
		</div>
	{/if}
</section>
