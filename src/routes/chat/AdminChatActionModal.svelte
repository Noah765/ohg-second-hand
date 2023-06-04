<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import Option from '$lib/components/Option.svelte';
	import OptionMultiple from '$lib/components/OptionMultiple.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatReportTimeType } from '$lib/format';
	import type { PageData } from './$types';
	import { createEventDispatcher } from 'svelte';

	export let user: Exclude<PageData['user'], null>;
	export let chat: Exclude<PageData['chats'], undefined>[number];

	const dispatch = createEventDispatcher();

	let actions: string = '';
	$: actions ??= '';

	let blockAccountTime = 3;
	let blockAccountTimeType = 1;
	let blockAccountDescription: HTMLTextAreaElement;

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

		blockAccountTime = parseInt(output);
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

		let accountBlockDuration: number;

		if (blockAccountTimeType === 0) accountBlockDuration = blockAccountTime;
		else if (blockAccountTimeType === 1) accountBlockDuration = blockAccountTime * 24;
		else if (blockAccountTimeType === 2) accountBlockDuration = blockAccountTime * 168;
		else if (blockAccountTimeType === 3) {
			const date = new Date();
			date.setMonth(date.getMonth() + blockAccountTime);
			const offset = Math.round((date.valueOf() - new Date().valueOf()) / 3600000);
			accountBlockDuration = offset;
		} else accountBlockDuration = 876600;

		const body = {
			deleteAllReportsChat: actions.includes('0') ? chat.id : undefined,
			deleteAllChatReportsAccount: actions.includes('1')
				? user.id === chat.offer.creator.id
					? chat.user.id
					: chat.offer.creator.id
				: undefined,
			deleteAllChatsUser: actions.includes('2')
				? user.id === chat.offer.creator.id
					? chat.user.id
					: chat.offer.creator.id
				: undefined,
			blockAccount: actions.includes('3')
				? {
						id: user.id === chat.offer.creator.id ? chat.user.id : chat.offer.creator.id,
						description: blockAccountDescription.value || blockAccountDescription.placeholder,
						duration: accountBlockDuration
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
			multipleValueRegex={/^.+(?=3)|0-(?=[12])/g}
		>
			{#if !/[12]/.test(actions)}
				<OptionMultiple value="0">Alle Meldungen zum Chat löschen</OptionMultiple>
			{/if}
			{#if !actions.includes('2')}
				<OptionMultiple value="1">Alle Meldungen zum Account löschen</OptionMultiple>
			{/if}
			<OptionMultiple value="2">Alle Chats vom Account löschen</OptionMultiple>
			<OptionMultiple value="3">Account blockieren</OptionMultiple>
		</Select>
	</div>
	{#if actions.includes('3')}
		<p class="mb-2 mt-6">Account blockieren:</p>
		<div class="flex text-xl">
			{#if blockAccountTimeType !== 4}
				<input
					type="text"
					on:keypress|preventDefault={(event) => numberInput(event)}
					on:keyup={(event) => {
						if (event.key !== 'Backspace' && event.key !== 'Delete') return;
						blockAccountTime = event.currentTarget.value === '' ? 3 : parseInt(event.currentTarget.value);
					}}
					placeholder="3"
					class="mr-4 w-20"
				/>
			{/if}
			<div class={blockAccountTimeType === 4 ? 'w-[28rem]' : 'w-[22rem]'}>
				<Select bind:value={blockAccountTimeType}>
					<Option value={0} selected={blockAccountTimeType === 0}>Stunden</Option>
					<Option value={1} selected={blockAccountTimeType === 1}>Tage</Option>
					<Option value={2} selected={blockAccountTimeType === 2}>Wochen</Option>
					<Option value={3} selected={blockAccountTimeType === 3}>Monate</Option>
					<Option value={4} selected={blockAccountTimeType === 4}>Dauerhaft</Option>
				</Select>
			</div>
		</div>
		<p class="mb-2 mt-4 text-xl">Begründung:</p>
		<textarea
			bind:this={blockAccountDescription}
			placeholder="Du bist aufgrund deines Chats mit {user.id} zum Angebot „{chat.offer
				.title}“ {blockAccountTimeType === 4
				? 'dauerhaft'
				: `für ${blockAccountTime} ${formatReportTimeType(blockAccountTimeType, blockAccountTime)}`} blockiert."
			class="min-h-[100px] text-xl"
		/>
	{/if}
	<p class="error mt-auto pt-10">{error}</p>
	<button on:click={submit} aria-busy={loading} disabled={loading} class="button-red mb-4 mt-2">Ausführen</button>
	<button on:click={() => dispatch('close')}>Abbrechen<iconify-icon icon="material-symbols:close-rounded" /></button>
</Modal>
