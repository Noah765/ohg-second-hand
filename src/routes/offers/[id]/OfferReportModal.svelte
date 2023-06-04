<script lang="ts">
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import Option from '$lib/components/Option.svelte';
	import Select from '$lib/components/Select.svelte';
	import type { WritableAlerts } from '../../Alerts.svelte';
	import type { PageData } from './$types';
	import { getContext } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let supabase: PageData['supabase'];
	export let user: PageData['user'];
	export let offerId: string;

	const dispatch = createEventDispatcher();
	const alerts: WritableAlerts = getContext('alerts');

	let loading = false;
	let error = '';

	let type: number;
	let description: string;

	async function submit() {
		loading = true;
		error = '';

		if (!user) return;

		const { error: supabaseError } = await supabase
			.from('offer_reports')
			.insert({ offer: offerId, reporter: user.id, type, description: description ? description : null });

		loading = false;

		if (supabaseError) {
			error = supabaseError.message;
			return;
		}

		dispatch('close');

		const alertId = Symbol();
		alerts.update((oldAlerts) => [
			...oldAlerts,
			{
				id: alertId,
				icon: 'material-symbols:report-outline-rounded',
				title: 'Angebot gemeldet',
				action: {
					text: 'Zu deine Angebotsmeldungen',
					function: () => {
						goto('/profile?offer-reports');
						alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
					}
				}
			}
		]);
	}
</script>

<Modal>
	<h5>Angebot melden</h5>
	<iconify-icon icon="material-symbols:flag-outline-rounded" class="my-2 text-9xl text-red-700" />
	<span class="line-red-700 mb-auto" />
	<form on:submit|preventDefault={submit} class="w-full">
		<Select bind:value={type} required placeholder="Meldeart">
			<Option value={0}>Spam</Option>
			<Option value={1}>Beleidigung</Option>
			<Option value={2}>Diskriminierung</Option>
			<Option value={3}>Verletzung der Privatsphäre</Option>
		</Select>
		<textarea bind:value={description} rows="4" placeholder="Beschreibung / Begründung" class="mt-2" />
		<p class="error">{error}</p>
		<button aria-busy={loading} disabled={loading} class="button-red my-4">Einreichen</button>
	</form>
	<button on:click={() => dispatch('close')}>Abbrechen<iconify-icon icon="material-symbols:close-rounded" /></button>
</Modal>
