<script lang="ts">
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import type { ActionData, SubmitFunction } from './$types';
	import { createEventDispatcher, onDestroy } from 'svelte';

	export let form: ActionData;

	const dispatch = createEventDispatcher();

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

			if (result.type !== 'success') return;

			success = true;
			time = 60;
			timer = setInterval(() => {
				time--;
				if (time === 0) clearInterval(timer);
			}, 1000);
		};
	};
</script>

<Modal>
	<h5>Nutzername vergessen</h5>
	<iconify-icon icon="material-symbols:account-circle-outline" class="my-2 text-9xl text-green-700" />
	<span class="line-green-700 mb-4" />
	<p>
		{#if success}
			Eine E-Mail mit deinem Nutzernamen wurde erfolgreich gesendet
		{:else}
			Gib deine E-Mail-Adresse ein, um eine E-Mail mit deinem Nutzernamen zu erhalten
		{/if}
	</p>
	<form method="POST" action="?/forgotName" use:enhance={submit} class="mt-auto w-full">
		<span class="error mb-2 block">{form?.forgotNameError ?? ''}</span>
		<input name="email" type="email" required value={form?.forgotNameData?.email ?? ''} placeholder="E-Mail-Adresse" />
		<button aria-busy={loading} disabled={loading || time !== 0} class="mb-6 mt-3">
			{#if time}
				Warte {time} Sekunden<iconify-icon icon="material-symbols:nest-clock-farsight-analog-outline-rounded" />
			{:else}
				E-Mail senden<iconify-icon icon="material-symbols:send-outline-rounded" />
			{/if}
		</button>
		<button type="button" on:click={() => dispatch('close')}>Schließen</button>
	</form>
</Modal>
