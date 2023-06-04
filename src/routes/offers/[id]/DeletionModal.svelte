<script lang="ts">
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import type { WritableAlerts } from '../../Alerts.svelte';
	import type { PageData } from './$types';
	import { getContext } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let supabase: PageData['supabase'];
	export let offerId: string;

	const dispatch = createEventDispatcher();
	const alerts: WritableAlerts = getContext('alerts');

	let loading = false;
	let error = '';

	async function submit() {
		loading = true;
		error = '';

		const { error: supabaseError } = await supabase.from('offers').delete().eq('id', offerId);

		loading = false;

		if (supabaseError) {
			error = supabaseError.message;
			return;
		}

		goto('/shop');

		const alertId = Symbol();
		alerts.update((oldAlerts) => [
			...oldAlerts,
			{
				id: alertId,
				color: 'red',
				icon: 'material-symbols:delete-rounded',
				title: 'Angebot gelöscht',
				action: {
					text: 'Zu deinen Angeboten',
					function: () => {
						goto('/profile/offers');
						alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
					}
				}
			}
		]);
	}
</script>

<Modal>
	<h5>Bestätigung erforderlich</h5>
	<iconify-icon icon="material-symbols:delete-outline-rounded" class="my-2 text-9xl text-red-700" />
	<span class="line-red-700 mb-4" />
	<p>Möchtest du dieses Angebot wirklich unwiderruflich löschen?</p>
	<p class="error mt-auto">{error}</p>
	<button on:click={submit} aria-busy={loading} disabled={loading} class="button-red mb-4 mt-2">Löschen</button>
	<button on:click={() => dispatch('close')}>Abbrechen<iconify-icon icon="material-symbols:close-rounded" /></button>
</Modal>
