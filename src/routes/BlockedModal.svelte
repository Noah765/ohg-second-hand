<script lang="ts">
	import { PUBLIC_EMAIL_ADDRESS } from '$env/static/public';
	import Modal from '$lib/components/Modal.svelte';
	import { formatReportTime } from '$lib/format';
	import { createEventDispatcher } from 'svelte';

	export let username: string;
	export let until: number;
	export let description: string;

	const dispatch = createEventDispatcher();
</script>

<Modal>
	<h5>Blockiert</h5>
	<iconify-icon icon="material-symbols:block" class="my-2 text-9xl text-red-700" />
	<span class="line-red-700 mb-4" />
	<span class="mb-4 text-center">
		{until < 4733510400000
			? `Du (${username}) bist bis zum ${formatReportTime(until)} blockiert.`
			: 'Du bist dauerhaft blockiert.'}
	</span>
	Begründung:
	<span class="text-center text-xl">{description}</span>
	<p class="my-4">Bei Rückfragen kannst du dich gerne bei {PUBLIC_EMAIL_ADDRESS} melden</p>
	<button class="mt-auto w-96" on:click={() => dispatch('close')}>Ok</button>
</Modal>
