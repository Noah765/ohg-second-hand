<script lang="ts">
	import { formatCategory, formatPrice, formatPriceFixed, formatTime } from '$lib/format';
	import ImageShow from './ImageShow.svelte';

	export let offer: {
		id: string;
		creator?: {
			id: string;
			name: string;
		};
		created_at: string;
		hidden?: boolean;
		title: string;
		images: string[] | null;
		description: string | null;
		category: number;
		price: number | null;
		price_fixed: boolean | null;
	};
</script>

<div class="relative [&:not(:last-child)]:mb-6">
	<div class="absolute left-[1.1rem] top-[1.1rem]"><ImageShow images={offer.images} height={192} width={256} /></div>
	<a
		href="/offers/{offer.id}"
		class="flex items-center rounded-3xl border-2 border-transparent p-4 shadow-3 hover:bg-neutral-100 active:border-black active:shadow-1"
	>
		<span class="h-48 min-w-[16rem]" />
		<span class="mx-6 h-44 min-w-[0.2rem] rounded-full bg-black" />
		<div class="flex h-48 w-full flex-col overflow-hidden">
			<div class="grid grid-cols-[auto,1fr] items-end gap-2 whitespace-nowrap">
				<span class="overflow-hidden overflow-ellipsis text-4xl">{offer.title}</span>
				{#if offer.creator}
					<span class="text-lg">
						von <a href="/profile/{offer.creator.id}" class="underline">{offer.creator.name}</a>
					</span>
				{/if}
			</div>
			<span class="mb-auto overflow-hidden text-xl">{offer.description ?? ''}</span>
			<span class="text-sm">{formatTime(offer.created_at)}</span>
			{formatPrice(offer.price)} ({formatPriceFixed(offer.price_fixed)})
		</div>
		<div class="flex h-48 flex-col items-end justify-between">
			{#if offer.hidden}<span class="opacity-50">Unsichtbar</span>{/if}
			<iconify-icon icon={formatCategory(offer.category).icon} class="mt-auto" />
		</div>
	</a>
</div>
