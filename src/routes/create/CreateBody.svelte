<script lang="ts">
	import { goto } from '$app/navigation';
	import Option from '$lib/components/Option.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatCategory } from '$lib/format';
	import ImageInput from '../../lib/components/ImageInput.svelte';
	import type { WritableAlerts } from '../Alerts.svelte';
	import type { PageData } from './$types';
	import { getContext } from 'svelte';

	export let supabase: PageData['supabase'];
	export let userId: string;

	const alerts: WritableAlerts = getContext('alerts');

	let loading = false;
	let error = '';

	let title = '';
	let images: Blob[];
	let description = '';
	let category: number | null = null;
	let price: number | null = null;
	let priceFixed: string | null = null;
	$: if (priceFixed === '0') price = null;

	async function submit() {
		loading = true;
		error = '';

		const promises = images.map((image) => supabase.storage.from('offer_images').upload(crypto.randomUUID(), image));
		const results = await Promise.all(promises);

		const imageUrls: string[] = [];
		for (const { data, error: supabaseError } of results) {
			if (supabaseError) {
				error = supabaseError.message;
				return;
			} else imageUrls.push(data.path);
		}

		const { error: supabaseError } = await supabase.from('offers').insert({
			hidden: false,
			creator: userId,
			title,
			images: imageUrls.length === 0 ? null : imageUrls,
			description,
			category: category!,
			price: price ? price * 100 : null,
			price_fixed: priceFixed === '0' ? null : priceFixed === '1' ? false : true
		});

		loading = false;

		if (supabaseError) {
			error = supabaseError.message;
			return;
		}

		goto('/shop');

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
						goto('/profile/offers');
						alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
					}
				}
			}
		]);
	}
</script>

<form on:submit|preventDefault={submit}>
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
					<Option value={category}>
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
				<Option value="0">Kostenlos</Option>
				<Option value="1">Verhandlung</Option>
				<Option value="2">Festpreis</Option>
			</Select>
		</div>
		<button aria-busy={loading} disabled={loading}>Fertig<iconify-icon icon="ic:round-check" /></button>
		<p class="error -mt-2">{error}</p>
	</section>
</form>
