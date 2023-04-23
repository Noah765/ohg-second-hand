<script lang="ts">
	import { scale } from 'svelte/transition';

	let expanded = false;
	let locket = false;

	const links = [
		{ icon: 'material-symbols:home-outline-rounded', size: 41, height: 27, to: '/', label: 'Link zur Startseite' },
		{
			icon: 'material-symbols:chat-outline-rounded',
			size: 36,
			height: 28,
			marginTop: 6,
			to: '/chat',
			label: 'Link zum Chat'
		},
		{ icon: 'uil:shop', size: 32.7, height: 30, to: '/shop', label: 'Link zum Shop' },
		{ icon: 'material-symbols:account-circle-full', size: 30, height: 30, to: '/profile', label: 'Link zum Profil' },
		{
			icon: 'material-symbols:add-circle-outline-rounded',
			size: 36,
			height: 30,
			to: '/create',
			label: 'Link zur Angebotserstellung'
		}
	];
</script>

<aside>
	<nav
		on:mouseenter={() => (expanded = true)}
		on:mouseleave={() => {
			if (!locket) expanded = false;
		}}
		on:focus={() => (expanded = true)}
		on:blur={() => {
			if (!locket) expanded = false;
		}}
		class:h-[295px]={expanded}
		class="fixed grid h-16 gap-4 rounded-full bg-neutral-900 p-4 transition-all"
	>
		<button
			aria-expanded="false"
			aria-label="Seitenleiste ausklappen"
			on:click={() => {
				locket = !locket;
				expanded = locket;
			}}
			class="button-hidden group grid h-8 items-center"
		>
			<span class="h-1 w-8 rounded-full bg-neutral-50 group-hover:bg-neutral-500" />
			<span
				class:ml-2={expanded}
				class="h-1 w-6 rounded-full bg-neutral-50 transition-[margin-left] group-hover:bg-neutral-500"
			/>
			<span
				class:ml-4={expanded}
				class="h-1 w-4 rounded-full bg-neutral-50 transition-[margin-left] group-hover:bg-neutral-500"
			/>
		</button>
		{#if expanded}
			{#each links as link, index}
				<a
					in:scale={{ delay: index * 40 }}
					out:scale={{ duration: 200 }}
					href={link.to}
					aria-label={link.label}
					style:height={`${link.height}px`}
					style:margin-top={`${link.marginTop}px`}
					class="flex w-8 items-center justify-center"
				>
					<iconify-icon
						icon={link.icon}
						style:font-size={`${link.size}px`}
						class="text-neutral-50 hover:text-neutral-500"
					/>
				</a>
			{/each}
		{/if}
	</nav>
</aside>
