<script lang="ts">
	import { formatImage, formatReport, formatTime } from '$lib/format';
	import type { PageData } from '../../routes/$types';

	export let supabase: PageData['supabase'];
	export let user: Exclude<PageData['user'], null>;

	export let report: {
		id: number;
		created_at?: string;
		chat: {
			id: number;
			user: { id: string; name: string; blocked?: true };
			offer: {
				id: string;
				creator: { id: string; name: string; blocked?: true };
				title: string;
			};
			messages: {
				receiver: string;
				created_at: string;
				message: string | null;
				images: string[] | null;
			}[];
		};
		reporter?: string;
		type: number;
		description: string | null;
	};

	let section = 0;
	let loadingMore = false;
	let loadMoreError = '';
	let fullyLoaded = report.chat.messages.length < 3;
	async function onScroll(event: UIEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (
			fullyLoaded ||
			loadingMore ||
			loadMoreError ||
			event.currentTarget.scrollTop + event.currentTarget.scrollHeight > event.currentTarget.offsetHeight + 100
		) {
			return;
		}

		loadingMore = true;
		section++;

		const { data, error } = await supabase
			.from('messages')
			.select('receiver, created_at, message, images')
			.eq('chat', report.chat.id)
			.order('created_at', { ascending: false })
			.range(section * 10 - 7, section * 10 + 2)
			.returns<typeof report.chat.messages>();

		loadingMore = false;

		if (error) {
			loadMoreError = error.message;
			return;
		}

		if (data.length < 10) fullyLoaded = true;
		report.chat.messages.push(...data);
		report.chat.messages = report.chat.messages;
	}
</script>

<div class="relative [&:not(:last-child)]:mb-6">
	<a
		href="/chat/{report.chat.id}"
		class="flex items-center rounded-3xl border-2 border-transparent p-4 shadow-3 hover:bg-neutral-100 active:border-black active:shadow-1"
	>
		<div class="flex h-64 w-full flex-col overflow-hidden">
			<div class="flex items-end whitespace-nowrap">
				<div class="text-xl">
					{#if user.id === report.chat.offer.id || user.id === report.chat.user.id}
						Chat mit
						<a
							href="/profile/{user.id === report.chat.offer.creator.id
								? report.chat.user.id
								: report.chat.offer.creator.id}"
							class="underline"
						>
							{user.id === report.chat.offer.creator.id ? report.chat.user.name : report.chat.offer.creator.name}
						</a>
						zum Angebot
					{:else}
						Chat von <a href="/profile/{report.chat.user.id}" class="underline">{report.chat.user.name}</a>
						{#if report.chat.user.blocked}<span class="text-red-700">(blockiert)</span>{/if} mit
						<a href="/profile/{report.chat.offer.creator.id}" class="underline">{report.chat.offer.creator.name}</a>
						{#if report.chat.offer.creator.blocked}<span class="text-red-700">(blockiert)</span>{/if}
						zu {report.chat.offer.creator.name}s Angebot
					{/if}
				</div>
				&nbsp;
				<a href="/offers/{report.chat.offer.id}" class="cursor-pointer underline">
					{report.chat.offer.title}
				</a>
			</div>
			<div class="mt-6 flex">
				<div class="min-w-[33%]">
					<span class="text-3xl">{formatReport(report.type)}</span>
					{#if report.reporter !== undefined && report.created_at !== undefined}
						<div class="-mt-1 mb-2 text-lg">
							gemeldet von
							<a href="/profile/{report.reporter}" class="underline">
								{report.chat.offer.creator.id === report.reporter
									? report.chat.offer.creator.name
									: report.chat.user.name}</a
							>;
							{formatTime(report.created_at)}
						</div>
					{/if}
					{#if report.description}
						<span class="overflow-hidden text-xl">{report.description}</span>
					{:else}
						<span class="text-xl opacity-50">Keine Beschreibung gegeben</span>
					{/if}
				</div>
				<div class="relative ml-16 h-48 w-full overflow-hidden">
					<div on:scroll={onScroll} class="flex h-full flex-col-reverse overflow-y-auto">
						{#each report.chat.messages as { receiver, created_at, message, images }, index (index)}
							<div class:ml-auto={receiver !== user.id} class="flex w-[30vw] flex-col">
								<div class="flex text-sm">{formatTime(created_at)}</div>
								<div
									class:!bg-neutral-600={receiver !== user.id}
									class="mb-4 flex flex-col rounded-xl border-[3px] border-black bg-neutral-100 p-2 px-4"
								>
									{message ?? ''}
									{#if images}
										{#each images as image, index}
											<img
												src={formatImage(image, 'message_images')}
												alt="Bild {index + 1} der Nachricht"
												class="my-1 rounded-2xl"
											/>
										{/each}
									{/if}
								</div>
							</div>
						{/each}
						{#if loadingMore}
							<span class="mb-6 mt-2 flex justify-center text-xl opacity-50">Laden...</span>
						{:else if loadMoreError}
							<span class="mb-6 mt-2 flex justify-center text-xl text-red-700">Fehler beim Laden: {loadMoreError}</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<slot />
	</a>
</div>
