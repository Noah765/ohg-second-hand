<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import Option from '$lib/components/Option.svelte';
	import OptionMultiple from '$lib/components/OptionMultiple.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatReport, formatReportTimeType } from '$lib/format';
	import type { PageData } from './$types';
	import { createEventDispatcher } from 'svelte';

	export let report: Exclude<PageData['chatReports'], null>[number] | undefined;

	const dispatch = createEventDispatcher();

	let actions: string = '';
	$: actions ??= '';

	let blockOtherUserTime = 3;
	let blockOtherUserTimeType = 1;
	let blockOtherUserDescription: HTMLTextAreaElement;

	let blockReportCreatorTime = 3;
	let blockReportCreatorTimeType = 1;
	let blockReportCreatorDescription: HTMLTextAreaElement;

	function numberInput(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement },
		type: 'otherUser' | 'reportCreator'
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

		if (type === 'otherUser') blockOtherUserTime = parseInt(output);
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

		let otherUserBlockDuration: number;

		if (blockOtherUserTimeType === 0) otherUserBlockDuration = blockOtherUserTime;
		else if (blockOtherUserTimeType === 1) otherUserBlockDuration = blockOtherUserTime * 24;
		else if (blockOtherUserTimeType === 2) otherUserBlockDuration = blockOtherUserTime * 168;
		else if (blockOtherUserTimeType === 3) {
			const date = new Date();
			date.setMonth(date.getMonth() + blockOtherUserTime);
			const offset = Math.round((date.valueOf() - new Date().valueOf()) / 3600000);
			otherUserBlockDuration = offset;
		} else otherUserBlockDuration = 876600;

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
			deleteChatReport: actions.includes('0') ? report.id : undefined,
			deleteAllReportsChat: actions.includes('1') ? report.chat.id : undefined,
			deleteAllChatReportsAccount: actions.includes('2')
				? report.reporter === report.chat.offer.creator.id
					? report.chat.user.id
					: report.chat.offer.creator.id
				: undefined,
			deleteAllChatReportsReporter: actions.includes('3') ? report.reporter : undefined,
			deleteChat: actions.includes('4') ? report.chat.id : undefined,
			deleteAllChatsUser: actions.includes('5')
				? report.reporter === report.chat.offer.creator.id
					? report.chat.user.id
					: report.chat.offer.creator.id
				: undefined,
			blockOtherUser: actions.includes('6')
				? {
						id: report.reporter === report.chat.offer.creator.id ? report.chat.user.id : report.chat.offer.creator.id,
						description: blockOtherUserDescription.value || blockOtherUserDescription.placeholder,
						duration: otherUserBlockDuration
				  }
				: undefined,
			blockReporter: actions.includes('7')
				? {
						id: report.reporter,
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
				<OptionMultiple value="1">Alle Meldungen zum Chat löschen</OptionMultiple>
			{/if}
			{#if !actions.includes('5')}
				<OptionMultiple value="2">Alle Meldungen zum Account löschen</OptionMultiple>
			{/if}
			<OptionMultiple value="3">Alle Meldungen vom Melder löschen</OptionMultiple>
			{#if !actions.includes('5')}
				<OptionMultiple value="4">Chat löschen</OptionMultiple>
			{/if}
			<OptionMultiple value="5">Alle Chats vom Gemeldeten löschen</OptionMultiple>
			<OptionMultiple value="6">Gemeldeten Nutzer blockieren</OptionMultiple>
			<OptionMultiple value="7">Ersteller der Meldung blockieren</OptionMultiple>
		</Select>
	</div>
	{#if actions.includes('6') && report !== undefined}
		<p class="mb-2 mt-6">Gemeldeten Nutzer blockieren:</p>
		<div class="flex text-xl">
			{#if blockOtherUserTimeType !== 4}
				<input
					type="text"
					on:keypress|preventDefault={(event) => numberInput(event, 'otherUser')}
					on:keyup={(event) => {
						if (event.key !== 'Backspace' && event.key !== 'Delete') return;
						blockOtherUserTime = event.currentTarget.value === '' ? 3 : parseInt(event.currentTarget.value);
					}}
					placeholder="3"
					class="mr-4 w-20"
				/>
			{/if}
			<div class={blockOtherUserTimeType === 4 ? 'w-[28rem]' : 'w-[22rem]'}>
				<Select bind:value={blockOtherUserTimeType}>
					<Option value={0} selected={blockOtherUserTimeType === 0}>Stunden</Option>
					<Option value={1} selected={blockOtherUserTimeType === 1}>Tage</Option>
					<Option value={2} selected={blockOtherUserTimeType === 2}>Wochen</Option>
					<Option value={3} selected={blockOtherUserTimeType === 3}>Monate</Option>
					<Option value={4} selected={blockOtherUserTimeType === 4}>Dauerhaft</Option>
				</Select>
			</div>
		</div>
		<p class="mb-2 mt-4 text-xl">Begründung:</p>
		<textarea
			bind:this={blockOtherUserDescription}
			placeholder="Du bist aufgrund deines Chats mit {report.reporter === report.chat.offer.creator.id
				? report.chat.user.name
				: report.chat.offer.creator.name} zum Angebot „{report.chat.offer.title}“ für {formatReport(
				report.type
			)} {blockOtherUserTimeType === 4
				? 'dauerhaft'
				: `für ${blockOtherUserTime} ${formatReportTimeType(blockOtherUserTimeType, blockOtherUserTime)}`} blockiert."
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
			placeholder="Du bist aufgrund deiner Meldung zum Chat mit {report.reporter === report.chat.offer.creator.id
				? report.chat.user.name
				: report.chat.offer.creator.name} zum Angebot „{report.chat.offer.title}“ {blockReportCreatorTimeType === 4
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
