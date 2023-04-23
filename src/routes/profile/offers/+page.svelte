<script lang="ts">
	import { formatCategory, formatPrice, formatPriceType, formatTime } from '$lib/format.js';

	export let data;
</script>

<section>
	{#if !data.user || !data.offers}
		<div class="flex flex-col">
			<h3 class="mb-4">Anmeldung erforderlich</h3>
			Melde dich an, um deine Angebote zu sehen:
			<a href="/register" class="button mt-4">
				Account erstellen<iconify-icon icon="material-symbols:arrow-forward-rounded" />
			</a>
			<span class="lines-green-800 my-2 w-full max-w-lg text-sm">Oder</span>
			<a href="/#login" class="button">Anmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" /></a>
		</div>
	{:else}
		<span class="text-6xl">Deine Angebote</span>
		<div class="mb-6 mt-4 rounded-2xl border-4 border-black p-6">
			<span class="text-4xl">{data.user.name}</span>
			<a href="/profile" class="button mt-4">
				Zurück zum Profil<iconify-icon icon="material-symbols:arrow-back-rounded" />
			</a>
		</div>
		<div class="rounded-2xl border-4 border-black p-6">
			<span class="mb-4 ml-2 flex text-3xl">Angebote</span>
			{#each data.offers as { id, created_at, title, description, category, price, price_type }}
				<a
					href="offers/{id}"
					class="flex cursor-pointer items-center rounded-3xl border-2 border-transparent p-4 shadow-[0_0_0_4px_black] hover:bg-[#cacaca] active:border-black active:shadow-[0_0_0_2px_black] [&:not(:last-child)]:mb-6"
				>
					<span class="h-48 min-w-[16rem] rounded-3xl bg-gray-500" />
					<span class="mx-6 h-44 min-w-[0.2rem] rounded-full bg-black" />
					<div class="flex h-48 w-full flex-col overflow-hidden">
						<span class="overflow-hidden overflow-ellipsis text-4xl">{title}</span>
						<span class="mb-auto overflow-hidden text-xl">{description}</span>
						<span class="text-sm">{formatTime(created_at)}</span>
						<div class="flex max-w-full items-center justify-between">
							<span> {formatPrice(price)} ({formatPriceType(price_type)}) </span>
							<iconify-icon icon={formatCategory(category).icon} />
						</div>
					</div>
				</a>
			{:else}
				Du besitzt momentan keine Angebote
			{/each}
		</div>
	{/if}
</section>
