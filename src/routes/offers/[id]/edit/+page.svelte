<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ImageInput from '$lib/components/ImageInput.svelte';
	import Option from '$lib/components/Option.svelte';
	import Select from '$lib/components/Select.svelte';
	import Underlined from '$lib/components/Underlined.svelte';
	import { formatCategory } from '$lib/format';
	import type { WritableAlerts } from '../../../Alerts.svelte';
	import type { PageData, SubmitFunction } from './$types.js';
	import { getContext } from 'svelte';

	let priceType: { html: string; value: any } | null = null;

	export let data: { user: PageData['user']; offer: Exclude<PageData['offer'], null> };
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
					title: 'Angebot aktualisiert',
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

<form method="POST" use:enhance={submit}>
	<section class="flex items-center justify-between">
		<h2><Underlined>Angebot bearbeiten</Underlined></h2>
		<div class="flex">
			<Select name="hidden">
				<Option value="false" selected={!data.offer.hidden}>Sichtbar</Option>
				<Option value="true" selected={data.offer.hidden}>Unsichtbar</Option>
			</Select>
			<a href="/offers/{$page.params.id}" class="button mx-3">Abbrechen</a>
			<div>
				<button aria-busy={loading} disabled={loading}>Speichern</button>
				<p class="error">{form?.error ?? ''}</p>
			</div>
		</div>
	</section>

	<section class="!rounded-tl-3xl">
		<input name="title" value={data.offer.title} required placeholder="Titel" />
	</section>

	<section class="grid gap-4">
		<div class="flex items-center">
			<ImageInput />
			<span class="line-vertical-black ml-4 mr-5 h-64" />
			<textarea name="description" value={data.offer.description} placeholder="Beschreibung (optional)" class="h-72" />
		</div>
		<span class="line-green-800 px-8" />
		<div class="flex">
			<Select name="category" required placeholder="Kategorie">
				{#each Array(9) as _, category}
					<Option value={category} selected={category === data.offer.category}>
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
					value={priceType?.value === '0' ? '' : data.offer.price}
					min="0"
					max="999.99"
					step="0.01"
					placeholder="00,00"
					class="w-32 pr-7"
				/>
				<span class="absolute bottom-0 right-2 top-0 flex items-center">€</span>
			</span>
			<Select name="priceType" required bind:selected={priceType} placeholder="Preisart">
				<Option value="0" selected={data.offer.price_type === null}>Kostenlos</Option>
				<Option value="1" selected={data.offer.price_type === true}>Verhandlung</Option>
				<Option value="2" selected={data.offer.price_type === false}>Festpreis</Option>
			</Select>
		</div>
	</section>
</form>
