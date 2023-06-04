<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';
	import ChatReportListItem from '$lib/components/ChatReportListItem.svelte';
	import OfferListItem from '$lib/components/OfferListItem.svelte';
	import OfferReportListItem from '$lib/components/OfferReportListItem.svelte';
	import AccountDeletionModal from './AccountDeletionModal.svelte';
	import ReportDeletionModal from './ReportDeletionModal.svelte';

	export let data;
	$: ({ supabase, user, offerCount, bookmarks, offerReports, chatReports } = data);

	$: page = ((searchParams: URLSearchParams) => {
		if (searchParams.has('offer-reports')) return 'offer-reports';
		if (searchParams.has('chat-reports')) return 'chat-reports';
		return 'bookmarks';
	})($pageStore.url.searchParams);

	let logoutLoading = false;
	let logoutError = '';
	async function logout() {
		logoutLoading = true;
		logoutError = '';

		const { error } = await supabase.auth.signOut();

		logoutLoading = false;
		if (error) logoutError = error.message;
		else goto('/');
	}

	let deleteAccountModal = false;

	let deleteReportModal: number | null = null;
</script>

{#if deleteAccountModal}
	<AccountDeletionModal {supabase} on:close={() => (deleteAccountModal = false)} />
{/if}

{#if deleteReportModal !== null}
	<ReportDeletionModal
		{supabase}
		type={page === 'offer-reports' ? 'offer_reports' : 'chat_reports'}
		reportId={deleteReportModal}
		on:close={() => (deleteReportModal = null)}
	/>
{/if}

<section class="relative rounded-bl-3xl">
	{#if !user}
		<div class="flex flex-col">
			<h3 class="mb-4">Anmeldung erforderlich</h3>
			Melde dich an, um dein Profil zu sehen:
			<a href="/register" class="button mt-4">
				Account erstellen<iconify-icon icon="material-symbols:arrow-forward-rounded" />
			</a>
			<span class="lines-green-800 my-2 w-full max-w-lg text-sm">Oder</span>
			<a href="/?login" class="button">Anmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" /></a>
		</div>
	{:else}
		<div>
			<span class="text-6xl">Profil</span>
			<div class="mb-6 mt-4 rounded-2xl border-4 border-black p-6">
				<span class="mb-6 block text-4xl">{user.name}</span>
				{#if offerCount === 0}
					<span>Du besitzt momentan keine Angebote</span>
				{:else}
					<a href="/profile/offers" class="text-4xl underline">
						{offerCount} Angebot{offerCount === 1 ? '' : 'e'}
					</a>
				{/if}
				<p class="error mt-10">{logoutError}</p>
				<button on:click={logout} aria-busy={logoutLoading} disabled={logoutLoading}>Abmelden</button>
				<button on:click={() => (deleteAccountModal = true)} class="mt-6">Account löschen</button>
			</div>
			<div class="rounded-2xl border-4 border-black p-6">
				<div class="mb-8 ml-2 flex text-3xl">
					<a href="/profile" class:opacity-50={page !== 'bookmarks'}>Merkliste</a>
					&nbsp;|&nbsp;
					<a href="/profile?offer-reports" class:opacity-50={page !== 'offer-reports'}>Angebotsmeldungen</a>
					&nbsp;|&nbsp;
					<a href="/profile?chat-reports" class:opacity-50={page !== 'chat-reports'}>Chat-Meldungen</a>
				</div>
				{#if bookmarks}
					{#each bookmarks as { offer }}
						<OfferListItem {offer} />
					{:else}
						<span class="ml-2 flex opacity-50">Es befinden sich momentan keine Angebote auf deiner Merkliste</span>
					{/each}
				{:else if offerReports}
					{#each offerReports as report}
						<OfferReportListItem {report}>
							<button on:click|preventDefault={() => (deleteReportModal = report.id)} class="ml-6 !w-min !p-4">
								<iconify-icon icon="material-symbols:delete-outline-rounded" />
							</button>
						</OfferReportListItem>
					{:else}
						<span class="ml-2 flex opacity-50">Du hast momentan keine offene Angebotsmeldungen</span>
					{/each}
				{:else if chatReports}
					{#each chatReports as report}
						<ChatReportListItem {supabase} {user} {report}>
							<button on:click|preventDefault={() => (deleteReportModal = report.id)} class="ml-6 !w-min !p-4">
								<iconify-icon icon="material-symbols:delete-outline-rounded" />
							</button>
						</ChatReportListItem>
					{:else}
						<span class="ml-2 flex opacity-50">Du hast momentan keine offene Chat-Meldungen</span>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</section>
