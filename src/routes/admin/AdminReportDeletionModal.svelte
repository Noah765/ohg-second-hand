<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData } from './$types';
	import { createEventDispatcher } from 'svelte';

	export let supabase: PageData['supabase'];
	export let type: 'offer_reports' | 'chat_reports';
	export let reportId: number;

	const dispatch = createEventDispatcher();

	let loading = false;
	let error = '';

	async function submit() {
		loading = true;
		error = '';

		const { error: supabaseError } = await supabase.from(type).delete().eq('id', reportId);

		loading = false;

		if (supabaseError) {
			error = supabaseError.message;
			return;
		}

		await invalidate('reports:data');
		dispatch('close');
	}
</script>

<Modal>
	<h5>Bestätigung erforderlich</h5>
	<iconify-icon icon="material-symbols:delete-outline-rounded" class="my-2 text-9xl text-red-700" />
	<span class="line-red-700 mb-4" />
	<p>Möchtest du diese Meldung löschen?</p>
	<p class="error mt-auto">{error}</p>
	<button on:click={submit} aria-busy={loading} disabled={loading} class="button-red mb-4 mt-2">Löschen</button>
	<button on:click={() => dispatch('close')}>Abbrechen<iconify-icon icon="material-symbols:close-rounded" /></button>
</Modal>
