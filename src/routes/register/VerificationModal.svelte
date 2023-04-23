<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import Modal from '$lib/components/Modal.svelte';
	import type { ActionData, SubmitFunction } from './$types';
	import { onDestroy } from 'svelte';

	let initialEmail = $page.url.searchParams.get('verification');

	export let form: ActionData;

	let resendVerificationEmailLoading = false;
	let resendVerificationEmailTime = 60;
	let resendVerificationEmailTimer = setInterval(() => {
		resendVerificationEmailTime--;
		if (resendVerificationEmailTime === 0) clearInterval(resendVerificationEmailTimer);
	}, 1000);
	let resentVerificationEmail = false;

	let cancelRegistrationLoading = false;

	onDestroy(() => clearInterval(resendVerificationEmailTimer));

	const verification: SubmitFunction = ({ action }) => {
		const resendVerificationEmail = action.searchParams.get('/resendVerificationEmail') !== null;

		if (resendVerificationEmail) {
			resendVerificationEmailLoading = true;
			resendVerificationEmailTime = 60;
			resendVerificationEmailTimer = setInterval(() => {
				resendVerificationEmailTime--;
				if (resendVerificationEmailTime === 0) clearInterval(resendVerificationEmailTimer);
			}, 1000);
		} else cancelRegistrationLoading = true;

		return async ({ update, result }) => {
			await update();

			if (!resendVerificationEmail) return;

			resendVerificationEmailLoading = false;
			if (result.type === 'success') resentVerificationEmail = true;
			else {
				clearInterval(resendVerificationEmailTimer);
				resendVerificationEmailTime = 0;
			}
		};
	};
</script>

<Modal>
	<h5>E-Mail-Adresse verifizieren</h5>
	<iconify-icon
		icon={initialEmail ? 'material-symbols:mark-email-unread-outline-rounded' : 'material-symbols:mail-outline-rounded'}
		class="my-2 text-9xl text-green-700"
	/>
	<span class="line-green-700 mb-4" />
	<p>
		{#if initialEmail}
			Eine Verifizierungs-E-Mail wurde {#if resentVerificationEmail}erneut{/if} an
			<span class="whitespace-nowrap">"{initialEmail}"</span> gesendet
		{:else}
			Gib deine E-Mail-Adresse an, um eine neue Verifizierungs-E-Mail zu senden
		{/if}
	</p>
	<form method="POST" use:enhance={verification} class="mt-auto w-full">
		<span class="error mb-2 block">{form?.modalError ?? ''}</span>
		<input
			name="email"
			type={initialEmail ? 'hidden' : 'email'}
			required
			value={form?.modalData?.email ?? initialEmail}
			placeholder="E-Mail-Adresse"
		/>
		<button
			formaction="?/resendVerificationEmail"
			aria-busy={resendVerificationEmailLoading}
			disabled={resendVerificationEmailLoading || resendVerificationEmailTime !== 0}
			class="mb-4 mt-2"
		>
			{#if resendVerificationEmailTime}
				Warte {resendVerificationEmailTime} Sekunden
				<iconify-icon icon="material-symbols:nest-clock-farsight-analog-outline-rounded" />
			{:else}
				E-Mail erneut senden<iconify-icon icon="material-symbols:send-outline-rounded" />
			{/if}
		</button>
		<button
			formaction="?/cancelRegistration"
			aria-busy={cancelRegistrationLoading}
			disabled={cancelRegistrationLoading}
			class="button-red"
		>
			Registrierung abbrechen<iconify-icon icon="material-symbols:close-rounded" />
		</button>
	</form>
</Modal>
