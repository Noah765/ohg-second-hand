<script lang="ts">
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import type { WritableAlerts } from '../Alerts.svelte';
	import type { PageData } from './$types';
	import { getContext } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let supabase: PageData['supabase'];

	const dispatch = createEventDispatcher();
	const alerts: WritableAlerts = getContext('alerts');

	let loading = false;
	let error = '';

	async function submit() {
		loading = true;
		error = '';

		const { error: deletionError } = await supabase.rpc('delete_user');
		if (deletionError) {
			loading = false;
			error = deletionError.message;
			return;
		}

		const { error: signOutError } = await supabase.auth.signOut();

		loading = false;

		if (signOutError) {
			error = signOutError.message;
			return;
		}

		goto('/');

		const alertId = Symbol();
		alerts.update((oldAlerts) => [
			...oldAlerts,
			{
				id: alertId,
				color: 'red',
				icon: 'material-symbols:delete-rounded',
				title: 'Account gelöscht',
				description: 'Dein Account wurde erfolgreich gelöscht'
			}
		]);
	}
</script>

<Modal>
	<h5>Bestätigung erforderlich</h5>
	<iconify-icon icon="material-symbols:delete-outline-rounded" class="my-2 text-9xl text-red-700" />
	<span class="line-red-700 mb-4" />
	<p>Möchtest du deinen Account wirklich unwiderruflich löschen?</p>
	<p class="error mt-auto">{error}</p>
	<button on:click={submit} aria-busy={loading} disabled={loading} class="button-red mb-4 mt-2">Löschen</button>
	<button on:click={() => dispatch('close')}>Abbrechen<iconify-icon icon="material-symbols:close-rounded" /></button>
</Modal>
