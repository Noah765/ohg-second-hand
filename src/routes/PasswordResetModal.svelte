<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Modal from '$lib/components/Modal.svelte';
	import type { ActionData, SubmitFunction } from './$types';
	import { createEventDispatcher, onDestroy } from 'svelte';

	export let name: string;
	export let form: ActionData;

	const token = $page.url.searchParams.get('passwordResetToken');

	const dispatch = createEventDispatcher();

	let passwordVisible = false;

	let loading = false;
	let success = false;
	let time = 0;
	let timer: NodeJS.Timer;

	onDestroy(() => clearInterval(timer));

	const submit: SubmitFunction = () => {
		loading = true;
		return async ({ update, result }) => {
			await update();
			loading = false;
			if (result.type === 'success') {
				success = true;
				time = 60;
				timer = setInterval(() => {
					time--;
					if (time === 0) clearInterval(timer);
				}, 1000);
			} else if (result.type === 'redirect') dispatch('close');
		};
	};

	function close() {
		if (token) goto('/');
		dispatch('close');
	}
</script>

<Modal>
	<h5>Passwort vergessen</h5>
	<iconify-icon icon="material-symbols:password-rounded" class="my-2 text-9xl text-green-700" />
	<span class="line-green-700 mb-4" />
	<p>
		{#if token}
			Gib ein neues Passwort ein
		{:else if success}
			Eine E-Mail zum Zurücksetzen des Passworts wurde erfolgreich gesendet
		{:else}
			Möchtest du eine E-Mail zum Zurücksetzen des Passworts senden?
		{/if}
	</p>
	<form
		method="POST"
		action={token ? `?/resetPasswordSubmit&token=${token}` : '?/resetPasswordSendEmail'}
		use:enhance={submit}
		class="mt-auto w-full"
	>
		<span class="error mb-2 block">{form?.resetPasswordError ?? ''}</span>
		{#if token}
			<div class="flex items-center">
				<input
					name="password"
					type={passwordVisible ? 'text' : 'password'}
					required
					minlength="6"
					autocomplete="new-password"
					placeholder="Neues Passwort"
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
		{:else}
			<input name="name" type="hidden" value={name} />
		{/if}
		<button aria-busy={loading} disabled={loading || time !== 0} class={token ? 'mb-6 mt-3' : 'mb-4'}>
			{#if token}
				Neues Passwort festlegen<iconify-icon icon="material-symbols:arrow-forward-rounded" />
			{:else if time}
				Warte {time} Sekunden<iconify-icon icon="material-symbols:nest-clock-farsight-analog-outline-rounded" />
			{:else}
				E-Mail senden<iconify-icon icon="material-symbols:send-outline-rounded" />
			{/if}
		</button>
		<button type="button" on:click={close}>
			{#if token}
				Abbrechen
			{:else}
				Schließen
			{/if}
		</button>
	</form>
</Modal>
