<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Option from '$lib/components/Option.svelte';
	import Select from '$lib/components/Select.svelte';
	import Underlined from '$lib/components/Underlined.svelte';
	import { formatCategory } from '$lib/format';
	import ImageInput from '../../lib/components/ImageInput.svelte';
	import type { WritableAlerts } from '../Alerts.svelte';
	import type { SubmitFunction } from './$types.js';
	import { getContext } from 'svelte';

	let priceType: { html: string; value: any } | null = null;

	export let form;

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
					icon: 'ic:round-playlist-add-check',
					title: 'Angebot erfolgreich erstellt',
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

<section>
	<h2><Underlined>Angebot erstellen</Underlined></h2>
</section>

<form method="POST" use:enhance={submit}>
	<section class="!rounded-tl-3xl">
		<input name="title" required placeholder="Titel" />
	</section>

	<section class="grid gap-4">
		<div class="flex items-center">
			<ImageInput />
			<span class="line-vertical-black ml-4 mr-5 h-64" />
			<textarea name="description" placeholder="Beschreibung (optional)" class="h-72" />
		</div>
		<span class="line-green-800 px-8" />
		<div class="flex">
			<Select name="category" required placeholder="Kategorie">
				{#each Array(9) as _, category}
					<Option value={category}>
						{formatCategory(category).name}<iconify-icon icon={formatCategory(category).icon} />
					</Option>
				{/each}
			</Select>
			<span class="relative ml-10 mr-4">
				<input
					name="price"
					type="number"
					aria-label="Preis"
					required={priceType?.value === '0' ? false : true}
					disabled={priceType?.value === '0'}
					value={priceType?.value === '0' ? '' : null}
					min="0"
					max="999.99"
					step="0.01"
					placeholder="00,00"
					class="w-32 pr-7"
				/>
				<span class="absolute bottom-0 right-2 top-0 flex items-center">€</span>
			</span>
			<Select name="priceType" required bind:selected={priceType} placeholder="Preisart">
				<Option value="0">Kostenlos</Option>
				<Option value="1">Verhandlung</Option>
				<Option value="2">Festpreis</Option>
			</Select>
		</div>
		<button aria-busy={loading} disabled={loading}>Fertig<iconify-icon icon="ic:round-check" /></button>
		<p class="error -mt-2">{form?.error ?? ''}</p>
	</section>
</form>
