<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData } from './$types';
	import { onDestroy } from 'svelte';

	let email = $page.url.searchParams.get('verification');

	export let supabase: PageData['supabase'];

	let error = '';

	let loading = false;
	let time = 0;
	let timer: NodeJS.Timer;
	if (email) {
		time = 30;
		timer = setInterval(() => {
			time--;
			if (time === 0) clearInterval(timer);
		}, 1000);
	}
	let successful = false;

	onDestroy(() => clearInterval(timer));

	function submit(
		event: Event & { readonly submitter: HTMLElement | null } & { currentTarget: EventTarget & HTMLFormElement }
	) {
		const email = (event.currentTarget[0] as HTMLInputElement).value;

		if (event.submitter === event.currentTarget[1]) {
			resend(email);
		} else {
			cancel(email);
		}
	}

	async function resend(email: string) {
		loading = true;
		error = '';
		time = 30;
		timer = setInterval(() => {
			time--;
			if (time === 0) clearInterval(timer);
		}, 1000);

		const { error: supabaseError } = await supabase.auth.resend({ type: 'signup', email });

		loading = false;

		if (supabaseError) error = supabaseError.message;
		else successful = true;
	}

	let cancelLoading = false;
	async function cancel(email: string) {
		cancelLoading = true;

		await supabase.rpc('delete_unverified_user', { email });

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
		{#if email}
			Eine Verifizierungs-E-Mail wurde {#if successful}erneut{/if} an
			<span class="whitespace-nowrap">"{email}"</span> gesendet
		{:else}
			Gib deine E-Mail-Adresse an, um eine neue Verifizierungs-E-Mail zu senden
		{/if}
	</p>
	<form on:submit|preventDefault={submit} class="mt-auto w-full">
		<span class="error mb-2 block">{error}</span>
		<input type={email ? 'hidden' : 'email'} value={email} required placeholder="E-Mail-Adresse" />
		<button aria-busy={loading} disabled={loading || time !== 0} class="mb-4 mt-2">
			{#if time}
				Warte {time} Sekunden
				<iconify-icon icon="material-symbols:nest-clock-farsight-analog-outline-rounded" />
			{:else}
				E-Mail erneut senden<iconify-icon icon="material-symbols:send-outline-rounded" />
			{/if}
		</button>
		<button aria-busy={cancelLoading} disabled={cancelLoading} class="button-red">
			Registrierung abbrechen<iconify-icon icon="material-symbols:close-rounded" />
		</button>
	</form>
</Modal>
