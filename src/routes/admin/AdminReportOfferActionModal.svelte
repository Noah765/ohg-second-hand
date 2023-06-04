<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import Option from '$lib/components/Option.svelte';
	import OptionMultiple from '$lib/components/OptionMultiple.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatReport, formatReportTimeType } from '$lib/format';
	import type { PageData } from './$types';
	import { createEventDispatcher } from 'svelte';

	export let report: Exclude<PageData['offerReports'], null>[number] | undefined;

	const dispatch = createEventDispatcher();

	let actions: string = '';
	$: actions ??= '';

	let blockOfferCreatorTime = 3;
	let blockOfferCreatorTimeType = 1;
	let blockOfferCreatorDescription: HTMLTextAreaElement;

	let blockReportCreatorTime = 3;
	let blockReportCreatorTimeType = 1;
	let blockReportCreatorDescription: HTMLTextAreaElement;

	function numberInput(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement },
		type: 'offerCreator' | 'reportCreator'
	) {
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

		if (type === 'offerCreator') blockOfferCreatorTime = parseInt(output);
		else blockReportCreatorTime = parseInt(output);
	}

	let error = '';
	let loading = false;
	async function submit() {
		if (report === undefined) return;

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

		let reportCreatorBlockedUntil: number;

		if (blockReportCreatorTimeType === 0) reportCreatorBlockedUntil = blockReportCreatorTime;
		else if (blockReportCreatorTimeType === 1) reportCreatorBlockedUntil = blockReportCreatorTime * 24;
		else if (blockReportCreatorTimeType === 2) reportCreatorBlockedUntil = blockReportCreatorTime * 168;
		else if (blockReportCreatorTimeType === 3) {
			const date = new Date();
			date.setMonth(date.getMonth() + blockReportCreatorTime);
			const offset = Math.round((date.valueOf() - new Date().valueOf()) / 3600000);
			reportCreatorBlockedUntil = offset;
		} else reportCreatorBlockedUntil = 876600;

		const body = {
			deleteOfferReport: actions.includes('0') ? report.id : undefined,
			deleteAllReportsOffer: actions.includes('1') ? report.offer.id : undefined,
			deleteAllOfferReportsAccount: actions.includes('2') ? report.offer.creator.id : undefined,
			deleteAllOfferReportsReporter: actions.includes('3') ? report.reporter.id : undefined,
			deleteOffer: actions.includes('4') ? report.offer.id : undefined,
			deleteAllOffersCreator: actions.includes('5') ? report.offer.creator.id : undefined,
			blockOtherUser: actions.includes('6')
				? {
						id: report.offer.creator.id,
						description: blockOfferCreatorDescription.value || blockOfferCreatorDescription.placeholder,
						duration: offerCreatorBlockDuration
				  }
				: undefined,
			blockReporter: actions.includes('7')
				? {
						id: report.reporter.id,
						description: blockReportCreatorDescription.value || blockReportCreatorDescription.placeholder,
						duration: reportCreatorBlockedUntil
				  }
				: undefined
		};

		const result = await fetch('', { method: 'post', body: JSON.stringify(body) });

		loading = false;

		if (!result.ok) {
			const response = await result.json();
			error = response.message;
			return;
		}

		if (/[012345]/g.test(actions)) await invalidate('reports:data');
		dispatch('close');
	}
</script>

<Modal>
	<h5>Weiteres Vorgehen</h5>
	<iconify-icon icon="material-symbols:flag-outline-rounded" class="my-2 text-9xl text-red-700" />
	<span class="line-red-700 mb-4" />
	<p>Wähle das weitere Vorgehen:</p>
	<div class="mt-2 w-full text-xl">
		<Select
			bind:value={actions}
			placeholder="Weiteres Vorgehen..."
			multiple
			multipleValueRegex={/^.+(?=[12])|^0-(?=[34])|^1-(?=(3-)?4)|^[^3]+(?=5)|^.+(?=3-(4-)?5)|4-(?=5)/g}
		>
			{#if !/[12345]/.test(actions)}
				<OptionMultiple value="0">Meldung löschen</OptionMultiple>
			{/if}
			{#if !/[245]/.test(actions)}
				<OptionMultiple value="1">Alle Meldungen zum Angebot löschen</OptionMultiple>
			{/if}
			{#if !actions.includes('5')}
				<OptionMultiple value="2">Alle Meldungen zum Account löschen</OptionMultiple>
			{/if}
			<OptionMultiple value="3">Alle Meldungen vom Melder löschen</OptionMultiple>
			{#if !actions.includes('5')}
				<OptionMultiple value="4">Angebot löschen</OptionMultiple>
			{/if}
			<OptionMultiple value="5">Alle Angebote vom Account löschen</OptionMultiple>
			<OptionMultiple value="6">Ersteller des Angebotes blockieren</OptionMultiple>
			<OptionMultiple value="7">Ersteller der Meldung blockieren</OptionMultiple>
		</Select>
	</div>
	{#if actions.includes('6') && report !== undefined}
		<p class="mb-2 mt-6">Ersteller des Angebotes blockieren:</p>
		<div class="flex text-xl">
			{#if blockOfferCreatorTimeType !== 4}
				<input
					type="text"
					on:keypress|preventDefault={(event) => numberInput(event, 'offerCreator')}
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
			placeholder="Du bist aufgrund deines Angebotes „{report.offer.title}“ für {formatReport(
				report.type
			)} {blockOfferCreatorTimeType === 4
				? 'dauerhaft'
				: `für ${blockOfferCreatorTime} ${formatReportTimeType(
						blockOfferCreatorTimeType,
						blockOfferCreatorTime
				  )}`} blockiert."
			class="min-h-[100px] text-xl"
		/>
	{/if}
	{#if actions.includes('7') && report !== undefined}
		<p class="mb-2 mt-6">Ersteller der Meldung blockieren:</p>
		<div class="flex text-xl">
			{#if blockReportCreatorTimeType !== 4}
				<input
					type="text"
					on:keypress|preventDefault={(event) => numberInput(event, 'reportCreator')}
					on:keyup={(event) => {
						if (event.key !== 'Backspace' && event.key !== 'Delete') return;
						blockReportCreatorTime = event.currentTarget.value === '' ? 3 : parseInt(event.currentTarget.value);
					}}
					placeholder="3"
					class="mr-4 w-20"
				/>
			{/if}
			<div class={blockReportCreatorTimeType === 4 ? 'w-[28rem]' : 'w-[22rem]'}>
				<Select bind:value={blockReportCreatorTimeType}>
					<Option value={0} selected={blockReportCreatorTimeType === 0}>Stunden</Option>
					<Option value={1} selected={blockReportCreatorTimeType === 1}>Tage</Option>
					<Option value={2} selected={blockReportCreatorTimeType === 2}>Wochen</Option>
					<Option value={3} selected={blockReportCreatorTimeType === 3}>Monate</Option>
					<Option value={4} selected={blockReportCreatorTimeType === 4}>Dauerhaft</Option>
				</Select>
			</div>
		</div>
		<p class="mb-2 mt-4 text-xl">Begründung:</p>
		<textarea
			bind:this={blockReportCreatorDescription}
			placeholder="Du bist aufgrund deiner Meldung zum Angebot „{report.offer.title}“ {blockReportCreatorTimeType === 4
				? 'dauerhaft'
				: `für ${blockReportCreatorTime} ${formatReportTimeType(
						blockReportCreatorTimeType,
						blockReportCreatorTime
				  )}`} blockiert."
			class="min-h-[100px] text-xl"
		/>
	{/if}
	<p class="error mt-auto pt-10">{error}</p>
	<button on:click={submit} aria-busy={loading} disabled={loading} class="button-red mb-4 mt-2">Ausführen</button>
	<button on:click={() => dispatch('close')}>Abbrechen<iconify-icon icon="material-symbols:close-rounded" /></button>
</Modal>
