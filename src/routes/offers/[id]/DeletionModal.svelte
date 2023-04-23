<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import type { WritableAlerts } from '../../Alerts.svelte';
	import type { SubmitFunction } from './$types';
	import { getContext } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	const alerts: WritableAlerts = getContext('alerts');

	let loading = false;

	const submit: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;

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
							// TODO: Goto own offers
							goto('/shop');
							alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
						}
					}
				}
			]);
		};
	};
</script>

<Modal>
	<h5>Bestätigung erforderlich</h5>
	<iconify-icon icon="material-symbols:delete-outline-rounded" class="my-2 text-9xl text-red-700" />
	<span class="line-red-700 mb-4" />
	<p>Willst du dieses Angebot wirklich unwiderruflich löschen?</p>
	<form method="POST" action="?/delete" use:enhance={submit} class="mt-auto w-full">
		<button aria-busy={loading} disabled={loading} class="button-red mb-4 mt-2">Löschen</button>
		<button type="button" on:click={() => dispatch('close')}>
			Abbrechen<iconify-icon icon="material-symbols:close-rounded" />
		</button>
	</form>
</Modal>
