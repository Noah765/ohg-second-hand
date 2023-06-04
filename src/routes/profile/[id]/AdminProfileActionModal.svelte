<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import Option from '$lib/components/Option.svelte';
	import OptionMultiple from '$lib/components/OptionMultiple.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatReportTimeType } from '$lib/format';
	import type { WritableAlerts } from '../../Alerts.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';

	export let userId: string;

	const dispatch = createEventDispatcher();
	const alerts: WritableAlerts = getContext('alerts');

	let actions: string = '';
	$: actions ??= '';

	let blockOfferCreatorTime = 3;
	let blockOfferCreatorTimeType = 1;
	let blockOfferCreatorDescription: HTMLTextAreaElement;

	function numberInput(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		const value = event.currentTarget.value;
		const key = event.key;
		const selectionStart = event.currentTarget.selectionStart!;
		const selectionEnd = event.currentTarget.selectionEnd!;

		const output = value.slice(0, selectionStart) + key + value.slice(selectionEnd);

		if (output.length > 3) return;

		event.currentTarget.value = output;

		const cursorPosition = selectionStart + 1;

		event.currentTarget.selectionStart = cursorPosition;
		event.currentTarget.selectionEnd = cursorPosition;

		blockOfferCreatorTime = parseInt(output);
	}

	let error = '';
	let loading = false;
	async function submit() {
		if (actions === '') {
			dispatch('close');
			return;
		}

		loading = true;
		error = '';

		let offerCreatorBlockDuration: number;

		if (blockOfferCreatorTimeType === 0) offerCreatorBlockDuration = blockOfferCreatorTime;
		else if (blockOfferCreatorTimeType === 1) offerCreatorBlockDuration = blockOfferCreatorTime * 24;
		else if (blockOfferCreatorTimeType === 2) offerCreatorBlockDuration = blockOfferCreatorTime * 168;
		else if (blockOfferCreatorTimeType === 3) {
			const date = new Date();
			date.setMonth(date.getMonth() + blockOfferCreatorTime);
			const offset = Math.round((date.valueOf() - new Date().valueOf()) / 3600000);
			offerCreatorBlockDuration = offset;
		} else offerCreatorBlockDuration = 876600;

		const body = {
			deleteAllOfferReportsAccount: actions.includes('0') ? userId : undefined,
			deleteAllChatReportsAccount: actions.includes('0') ? userId : undefined,
			deleteAllOffersCreator: actions.includes('1') ? userId : undefined,
			deleteAllChatsUser: actions.includes('2') ? userId : undefined,
			blockOfferCreator: actions.includes('3')
				? {
						id: userId,
						description: blockOfferCreatorDescription.value || blockOfferCreatorDescription.placeholder,
						duration: offerCreatorBlockDuration
				  }
				: undefined
		};

		const result = await fetch('/admin', { method: 'post', body: JSON.stringify(body) });

		loading = false;

		if (!result.ok) {
			const response = await result.json();
			error = response.message;
			return;
		}

		const alertId = Symbol();
		alerts.update((oldAlerts) => [
			...oldAlerts,
			{
				id: alertId,
				icon: 'material-symbols:flag-outline-rounded',
				title: 'Aktionen erfolgreich',
				description: 'Die ausgewählten Aktionen wurden erfolgreich durchgeführt'
			}
		]);

		dispatch('close');
	}
</script>

<Modal>
	<h5>Weiteres Vorgehen</h5>
	<iconify-icon icon="material-symbols:flag-outline-rounded" class="my-2 text-9xl text-red-700" />
	<span class="line-red-700 mb-4" />
	<p>Wähle das weitere Vorgehen:</p>
	<div class="mt-2 w-full text-xl">
		<Select bind:value={actions} placeholder="Weiteres Vorgehen..." multiple multipleValueRegex={/0-(?=1)/g}>
			{#if !actions.includes('1')}
				<OptionMultiple value="0">Alle Meldungen zum Account löschen</OptionMultiple>
			{/if}
			<OptionMultiple value="1">Alle Angebote vom Account löschen</OptionMultiple>
			<OptionMultiple value="2">Alle Chats vom Account löschen</OptionMultiple>
			<OptionMultiple value="3">Account blockieren</OptionMultiple>
		</Select>
	</div>
	{#if actions.includes('3')}
		<p class="mb-2 mt-6">Account blockieren:</p>
		<div class="flex text-xl">
			{#if blockOfferCreatorTimeType !== 4}
				<input
					type="text"
					on:keypress|preventDefault={(event) => numberInput(event)}
					on:keyup={(event) => {
						if (event.key !== 'Backspace' && event.key !== 'Delete') return;
						blockOfferCreatorTime = event.currentTarget.value === '' ? 3 : parseInt(event.currentTarget.value);
					}}
					placeholder="3"
					class="mr-4 w-20"
				/>
			{/if}
			<div class={blockOfferCreatorTimeType === 4 ? 'w-[28rem]' : 'w-[22rem]'}>
				<Select bind:value={blockOfferCreatorTimeType}>
					<Option value={0} selected={blockOfferCreatorTimeType === 0}>Stunden</Option>
					<Option value={1} selected={blockOfferCreatorTimeType === 1}>Tage</Option>
					<Option value={2} selected={blockOfferCreatorTimeType === 2}>Wochen</Option>
					<Option value={3} selected={blockOfferCreatorTimeType === 3}>Monate</Option>
					<Option value={4} selected={blockOfferCreatorTimeType === 4}>Dauerhaft</Option>
				</Select>
			</div>
		</div>
		<p class="mb-2 mt-4 text-xl">Begründung:</p>
		<textarea
			bind:this={blockOfferCreatorDescription}
			placeholder="Du bist {blockOfferCreatorTimeType === 4
				? 'dauerhaft'
				: `für ${blockOfferCreatorTime} ${formatReportTimeType(
						blockOfferCreatorTimeType,
						blockOfferCreatorTime
				  )}`} blockiert."
			class="min-h-[100px] text-xl"
		/>
	{/if}
	<p class="error mt-auto pt-10">{error}</p>
	<button on:click={submit} aria-busy={loading} disabled={loading} class="button-red mb-4 mt-2">Ausführen</button>
	<button on:click={() => dispatch('close')}>Abbrechen<iconify-icon icon="material-symbols:close-rounded" /></button>
</Modal>
