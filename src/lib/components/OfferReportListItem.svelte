<script lang="ts">
	import { formatReport, formatTime } from '$lib/format';
	import ImageShow from './ImageShow.svelte';

	export let report: {
		id: number;
		created_at: string;
		offer: {
			id: string;
			creator: { id: string; name: string; blocked?: true };
			title: string;
			images: string[] | null;
		};
		reporter?: { id: string; name: string; blocked?: true };
		type: number;
		description: string | null;
	};
</script>

<div class="relative [&:not(:last-child)]:mb-6">
	<div class="absolute left-[1.1rem] top-[1.1rem]">
		<ImageShow images={report.offer.images} height={192} width={256} />
	</div>
	<a
		href="/offers/{report.offer.id}"
		class="flex items-center rounded-3xl border-2 border-transparent p-4 shadow-3 hover:bg-neutral-100 active:border-black active:shadow-1"
	>
		<span class="h-48 min-w-[16rem]" />
		<span class="mx-6 h-44 min-w-[0.2rem] rounded-full bg-black" />
		<div class="flex h-48 w-full flex-col overflow-hidden">
			<div class="flex items-end whitespace-nowrap">
				<span class="overflow-hidden overflow-ellipsis text-4xl">{report.offer.title}</span>
				<span class="text-lg">&nbsp;von&nbsp;</span>
				<a href="/profile/{report.offer.creator.id}" class="text-lg underline">{report.offer.creator.name}</a>
				{#if report.offer.creator.blocked}<span class="text-lg text-red-700">&nbsp;(blockiert)</span>{/if}
			</div>
			<div class="mt-6 flex items-end whitespace-nowrap">
				<span class="overflow-hidden overflow-ellipsis text-3xl">
					{formatReport(report.type)}
				</span>
				{#if report.reporter !== undefined}
					<div class="text-lg">
						&nbsp;gemeldet von
						<a href="/profile/{report.reporter.id}" class="underline">
							{report.reporter.name}</a
						>{#if report.reporter.blocked}<span class="text-red-700">(blockiert)</span>{/if};
						{formatTime(report.created_at)}
					</div>
				{/if}
			</div>
			{#if report.description}
				<span class="overflow-hidden text-xl">{report.description}</span>
			{:else}
				<span class="text-xl opacity-50">Keine Beschreibung gegeben</span>
			{/if}
		</div>
		<slot />
	</a>
</div>
