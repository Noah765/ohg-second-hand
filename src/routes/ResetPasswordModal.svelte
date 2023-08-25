<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData } from './$types';
	import { createEventDispatcher, onDestroy } from 'svelte';

	export let type: 'email' | 'password';
	export let supabase: PageData['supabase'];
	export let email: string;

	const dispatch = createEventDispatcher();

	let passwordVisible = false;

	let loading = false;
	let success = false;
	let error = '';
	let time = 0;
	let timer: NodeJS.Timer;

	onDestroy(() => clearInterval(timer));

	function submit() {
		if (type === 'email') sendEmail();
		else setPassword();
	}

	async function sendEmail() {
		loading = true;
		error = '';

		const { data: emailUsed, error: checkEmailUsedError } = await supabase.rpc('is_email_used', { email });
		if (checkEmailUsedError) {
			error = checkEmailUsedError.message;
			return;
		}
		if (!emailUsed) {
			error = 'Es wurde kein bestehendes Profil mit dieser E-Mail-Adresse gefunden';
			loading = false;
			return;
		}

		time = 60;
		timer = setInterval(() => {
			time--;
			if (time === 0) clearInterval(timer);
		}, 1000);

		const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: 'https://ohg-second-hand.vercel.app?reset-password'
		});

		loading = false;

		if (supabaseError) error = supabaseError.message;
		else success = true;
	}

	let password = '';
	async function setPassword() {
		loading = true;
		error = '';

		const { error: supabaseError } = await supabase.auth.updateUser({ password });

		loading = false;

		if (supabaseError) error = supabaseError.message;
		else dispatch('close');
	}
</script>

<Modal>
	<h5>Passwort vergessen</h5>
	<iconify-icon icon="material-symbols:password-rounded" class="my-2 text-9xl text-green-700" />
	<span class="line-green-700 mb-4" />
	<p>
		{#if type === 'email'}
			{#if success}
				Eine E-Mail zum Zurücksetzen des Passworts wurde erfolgreich gesendet
			{:else}
				Möchtest du eine E-Mail zum Zurücksetzen des Passworts senden?
			{/if}
		{:else}
			Gib ein neues Passwort ein
		{/if}
	</p>
	<form method="POST" on:submit|preventDefault={submit} class="mt-auto w-full">
		<span class="error mb-2 block">{error}</span>
		{#if type === 'email'}
			<input bind:value={email} type="email" required placeholder="E-Mail-Adresse" />
		{:else}
			<div class="flex items-center">
				<input
					on:input={(e) => (password = e.currentTarget.value)}
					type={passwordVisible ? 'text' : 'password'}
					required
					minlength="6"
					autocomplete="current-password"
					placeholder="Passwort"
				/>
				<button
					type="button"
					on:click={() => (passwordVisible = !passwordVisible)}
					aria-label={passwordVisible ? 'Passwort verstecken' : 'Passwort anzeigen'}
					class="button-hidden absolute right-12 h-[30px]"
				>
					<iconify-icon
						icon={passwordVisible
							? 'material-symbols:visibility-off-outline-rounded'
							: 'material-symbols:visibility-outline-rounded'}
					/>
				</button>
			</div>
		{/if}
		<button aria-busy={loading} disabled={loading || time !== 0} class="mb-6 mt-3">
			{#if type === 'email' && !time}
				E-Mail senden<iconify-icon icon="material-symbols:send-outline-rounded" />
			{:else if time}
				Warte {time} Sekunden<iconify-icon icon="material-symbols:nest-clock-farsight-analog-outline-rounded" />
			{:else}
				Neues Passwort festlegen<iconify-icon icon="material-symbols:arrow-forward-rounded" />
			{/if}
		</button>
	</form>
	<button on:click={() => dispatch('close')}>
		{#if type === 'email'}
			Schließen
		{:else}
			Abbrechen
		{/if}
	</button>
</Modal>
