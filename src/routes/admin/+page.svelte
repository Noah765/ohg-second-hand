<script lang="ts">
	import { page as pageStore } from '$app/stores';
	import ChatReportListItem from '$lib/components/ChatReportListItem.svelte';
	import OfferReportListItem from '$lib/components/OfferReportListItem.svelte';
	import Underlined from '$lib/components/Underlined.svelte';
	import AdminReportChatActionModal from './AdminReportChatActionModal.svelte';
	import AdminReportOfferDeletionModal from './AdminReportDeletionModal.svelte';
	import AdminReportOfferActionModal from './AdminReportOfferActionModal.svelte';

	export let data;
	$: ({ supabase, user, offerReports, chatReports, offerReportsCount } = data);

	$: url = $pageStore.url;

	$: page = Number(url.searchParams.get('page') ?? 1);

	$: pageCount = Math.ceil(offerReportsCount / 10);

	function getPageUrl(page: number) {
		const urlCopy = new URL(url.href);
		urlCopy.searchParams.set('page', String(page));
		return urlCopy.href;
	}

	let actionModal: number | null = null;
	let deleteModal: number | null = null;
</script>

<section>
	<h2><Underlined>Admin Zentrale</Underlined></h2>
</section>

{#if actionModal !== null && offerReports !== null}
	<AdminReportOfferActionModal
		report={offerReports.find((report) => report.id === actionModal)}
		on:close={() => (actionModal = null)}
	/>
{:else if actionModal !== null && chatReports !== null}
	<AdminReportChatActionModal
		report={chatReports.find((report) => report.id === actionModal)}
		on:close={() => (actionModal = null)}
	/>
{/if}

{#if deleteModal !== null}
	<AdminReportOfferDeletionModal
		{supabase}
		type={offerReports === null ? 'chat_reports' : 'offer_reports'}
		reportId={deleteModal}
		on:close={() => (deleteModal = null)}
	/>
{/if}

<section>
	<div class="mb-8 ml-2 flex text-3xl">
		<a href="/admin" class:opacity-50={url.searchParams.has('chat-reports')}>Angebotsmeldungen</a>
		&nbsp;|&nbsp;
		<a href="/admin?chat-reports" class:opacity-50={!url.searchParams.has('chat-reports')}>Chat-Meldungen</a>
	</div>

	{#if page > 1}
		<div class="mb-4 rounded-2xl p-4 text-lg shadow-[0_0_0_3px_black]">
			Seite {page} von {pageCount} ({offerReportsCount} Meldungen)
		</div>
	{/if}

	{#if offerReports !== null}
		{#each offerReports as report}
			<OfferReportListItem {report}>
				<div class="ml-6 flex flex-col">
					<button on:click|preventDefault={() => (actionModal = report.id)} class="mb-4">
						<iconify-icon icon="material-symbols:flag-outline-rounded" />
					</button>
					<button on:click|preventDefault={() => (deleteModal = report.id)}>
						<iconify-icon icon="material-symbols:delete-outline-rounded" />
					</button>
				</div>
			</OfferReportListItem>
		{:else}
			<span class="opacity-50">Es gibt momentan keine Angebotsmeldungen</span>
		{/each}
	{:else if chatReports !== null && user !== null}
		{#each chatReports as report}
			<ChatReportListItem {supabase} {user} {report}>
				<div class="ml-6 flex flex-col">
					<button on:click|preventDefault={() => (actionModal = report.id)} class="mb-4">
						<iconify-icon icon="material-symbols:flag-outline-rounded" />
					</button>
					<button on:click|preventDefault={() => (deleteModal = report.id)}>
						<iconify-icon icon="material-symbols:delete-outline-rounded" />
					</button>
				</div>
			</ChatReportListItem>
		{:else}
			<span class="opacity-50">Es gibt momentan keine Chat-Meldungen</span>
		{/each}
	{/if}

	{#if pageCount > 1}
		<div class="mb-4 rounded-2xl p-4 text-lg shadow-[0_0_0_3px_black]">
			Seiten:
			{#if page > 3}
				<a href={getPageUrl(1)} class="underline">1</a>&nbsp;
			{/if}
			{#if page > 2}
				<a href={getPageUrl(page - 2)} class="underline">{page - 2}</a>
			{/if}
			{#if page > 1}
				<a href={getPageUrl(page - 1)} class="underline">{page - 1}</a>&nbsp;
			{/if}
			{page}
			{#if page < pageCount}
				&nbsp;<a href={getPageUrl(page + 1)} class="underline">{page + 1}</a>
			{/if}
			{#if page < pageCount - 1}
				<a href={getPageUrl(page + 2)} class="underline">{page + 2}</a>
			{/if}
			{#if page < pageCount - 2}
				&nbsp;<a href={getPageUrl(pageCount)} class="underline">{pageCount}</a>
			{/if}
			({offerReportsCount} Meldungen)
		</div>
	{/if}
</section>
