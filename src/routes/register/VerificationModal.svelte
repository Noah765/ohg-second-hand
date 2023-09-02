<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData } from './$types';
	import { onDestroy } from 'svelte';

	const email = $page.url.searchParams.get('verification');

	export let supabase: PageData['supabase'];

	let error = '';

	let loading = false;
	let time = 30;
	let timer = setInterval(() => {
		time--;
		if (time === 0) clearInterval(timer);
	}, 1000);
	let successful = false;

	onDestroy(() => clearInterval(timer));

	async function resend() {
		loading = true;
		error = '';
		time = 30;
		timer = setInterval(() => {
			time--;
			if (time === 0) clearInterval(timer);
		}, 1000);

		const { error: supabaseError } = await supabase.auth.resend({ type: 'signup', email: email + '@ohg-monheim.eu' });

		loading = false;

		if (supabaseError) error = supabaseError.message;
		else successful = true;
	}

	let cancelLoading = false;
	async function cancel() {
		cancelLoading = true;

		await supabase.rpc('delete_unverified_user', { email: email + '@ohg-monheim.eu' });

		goto('/');
	}
</script>

<Modal>
	<h5>E-Mail-Adresse verifizieren</h5>
	<iconify-icon
		icon={email ? 'material-symbols:mark-email-unread-outline-rounded' : 'material-symbols:mail-outline-rounded'}
		class="my-2 text-9xl text-green-700"
	/>
	<span class="line-green-700 mb-4" />
	<p>
		Eine Verifizierungs-E-Mail wurde {#if successful}erneut{/if} an
		<span class="whitespace-nowrap">"{email}@ohg-monheim.eu"</span> gesendet
	</p>
	<span class="error mb-2 mt-auto block">{error}</span>
	<button on:click={resend} aria-busy={loading} disabled={loading || time !== 0} class="mb-4">
		{#if time}
			Warte {time} Sekunden
			<iconify-icon icon="material-symbols:nest-clock-farsight-analog-outline-rounded" />
		{:else}
			E-Mail erneut senden<iconify-icon icon="material-symbols:send-outline-rounded" />
		{/if}
	</button>
	<button on:click={cancel} aria-busy={cancelLoading} disabled={cancelLoading} class="button-red">
		Registrierung abbrechen<iconify-icon icon="material-symbols:close-rounded" />
	</button>
</Modal>
