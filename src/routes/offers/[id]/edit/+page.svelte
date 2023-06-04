<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import ImageInput from '$lib/components/ImageInput.svelte';
	import Option from '$lib/components/Option.svelte';
	import Select from '$lib/components/Select.svelte';
	import Underlined from '$lib/components/Underlined.svelte';
	import { formatCategory } from '$lib/format';
	import type { WritableAlerts } from '../../../Alerts.svelte';
	import type { PageData } from './$types.js';
	import { getContext } from 'svelte';

	export let data: { supabase: PageData['supabase']; offer: Exclude<PageData['offer'], null> };
	const { supabase, offer } = data;

	const alerts: WritableAlerts = getContext('alerts');

	let loading = false;
	let error = '';

	let hidden: boolean;
	let title = offer.title;
	let images: (string | Blob)[] = JSON.parse(JSON.stringify(offer.images)) ?? [];
	let description = offer.description;
	let category: number;
	let price = offer.price ? offer.price / 100 : null;
	let priceFixed: string;
	$: if (priceFixed === '0') price = null;

	async function submit() {
		loading = true;
		error = '';

		type UploadResult = { error: { message: string } | null };

		const promises: Promise<UploadResult>[] = [];
		images.forEach((image, index) => {
			if (typeof image === 'string') return;
			const uuid = crypto.randomUUID();
			images[index] = uuid;
			promises.push(supabase.storage.from('offer_images').upload(uuid, image));
		});
		const results = await Promise.all(promises);

		for (const { error: supabaseError } of results) {
			if (supabaseError) {
				error = supabaseError.message;
				return;
			}
		}

		const { error: supabaseError } = await supabase
			.from('offers')
			.update({
				hidden,
				title,
				images: images.length === 0 ? null : (images as string[]),
				description,
				category,
				price: price ? price * 100 : null,
				price_fixed: priceFixed === '0' ? null : priceFixed === '1' ? false : true
			})
			.eq('id', offer.id);

		loading = false;

		if (supabaseError) {
			error = supabaseError.message;
			return;
		}

		invalidate('supabase:offer');
		setTimeout(() => goto(`/offers/${offer.id}`));

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
						goto('/profile/offers');
						alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
					}
				}
			}
		]);
	}
</script>

<form on:submit|preventDefault={submit}>
	<section class="flex items-center justify-between">
		<h2><Underlined>Angebot bearbeiten</Underlined></h2>
		<div class="flex">
			<Select bind:value={hidden}>
				<Option value={false} selected={!offer.hidden}>Sichtbar</Option>
				<Option value={true} selected={offer.hidden}>Unsichtbar</Option>
			</Select>
			<a href="/offers/{offer.id}" class="button mx-3">Abbrechen</a>
			<div>
				<button aria-busy={loading} disabled={loading}>Speichern</button>
				<p class="error">{error}</p>
			</div>
		</div>
	</section>

	<section class="!rounded-tl-3xl">
		<input bind:value={title} required placeholder="Titel" />
	</section>

	<section class="grid gap-4">
		<div class="flex items-center">
			<ImageInput bind:images />
			<span class="line-vertical-black ml-4 mr-5 h-64" />
			<textarea bind:value={description} placeholder="Beschreibung (optional)" class="h-72" />
		</div>
		<span class="line-green-800 px-8" />
		<div class="flex">
			<Select bind:value={category} required placeholder="Kategorie">
				{#each Array(9) as _, category}
					<Option value={category} selected={category === offer.category}>
						{formatCategory(category).name}<iconify-icon icon={formatCategory(category).icon} />
					</Option>
				{/each}
			</Select>
			<span class="relative ml-10 mr-4">
				<input
					type="number"
					bind:value={price}
					aria-label="Preis"
					required={priceFixed === '0' ? false : true}
					disabled={priceFixed === '0'}
					min="0"
					max="999.99"
					step="0.01"
					placeholder="00,00"
					class="w-32 pr-7"
				/>
				<span class="absolute bottom-0 right-2 top-0 flex items-center">€</span>
			</span>
			<Select bind:value={priceFixed} required placeholder="Preisart">
				<Option value="0" selected={offer.price_fixed === null}>Kostenlos</Option>
				<Option value="1" selected={offer.price_fixed === false}>Verhandlung</Option>
				<Option value="2" selected={offer.price_fixed === true}>Festpreis</Option>
			</Select>
		</div>
	</section>
</form>
