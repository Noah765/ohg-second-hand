<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { SubmitFunction } from './$types.js';
	import ForgotNameModal from './ForgotNameModal.svelte';
	import PasswordResetModal from './PasswordResetModal.svelte';

	export let data;

	const categories = [
		{ id: 7, image: 'electronic', icon: 'ic:twotone-smartphone', name: 'Elektronik' },
		{ id: 3, image: 'summer_clothes', icon: 'ph:t-shirt-fill', name: 'Sommerkleidung' },
		{ id: 0, image: 'video_games', icon: 'ph:game-controller-fill', name: 'Videospiele' },
		{ id: 5, image: 'sport', icon: 'material-symbols:sports-football-rounded', name: 'Sportsachen' },
		{ id: 2, image: 'books', icon: 'ph:books-fill', name: 'Bücher' },
		{ id: 6, image: 'school', icon: 'map:school', name: 'Schulsachen' },
		{ id: 1, image: 'social_games', icon: 'bxs:chess', name: 'Gesellschaftsspiele' },
		{ id: 8, image: 'other', icon: 'mdi:dots-horizontal-circle', name: 'Sonstiges' },
		{ id: 4, image: 'winter_clothes', icon: 'game-icons:winter-gloves', name: 'Winterkleidung' }
	];

	let pageWidth: number;

	let categoryColumns = 0;

	$: if (pageWidth > 1000) categoryColumns = 3;
	else if (pageWidth > 700) categoryColumns = 2;
	else if (pageWidth) categoryColumns = 1;

	function computeRelevantCategories(column: number, maxColumns: number) {
		return categories.slice((9 / maxColumns) * column, (9 / maxColumns) * (column + 1));
	}

	export let form;

	let name: string;
	let passwordVisible = false;
	let passwordRequired = true;

	let forgotNameModal = false;
	let passwordResetModal = $page.url.searchParams.has('passwordResetToken');

	let loginLoading = false;
	const submitLogin: SubmitFunction = ({ action, cancel }) => {
		if (action.pathname === '/forgotPassword') {
			passwordResetModal = true;
			return cancel();
		}

		loginLoading = true;
		return async ({ update, result }) => {
			await update();
			loginLoading = false;
			if (result.type === 'failure') name = String((result.data as any)?.data?.name ?? '');
		};
	};

	let logoutLoading = false;
	const submitLogout: SubmitFunction = () => {
		logoutLoading = true;
		return async ({ update }) => {
			await update();
			logoutLoading = false;
		};
	};
</script>

<svelte:head>
	<title>Startseite - OHG Second Hand</title>
	<meta name="description" content="Startseite der OHG Second Hand Webseite" />
</svelte:head>

<svelte:window bind:innerWidth={pageWidth} />

<section>
	<h1 class="mb-12">
		Second Hand<br />
		<span class="text-8xl leading-tight text-green-700">leicht</span><br />
		gemacht
	</h1>

	{#if data.user}
		<form method="POST" action="?/logout" use:enhance={submitLogout}>
			<button aria-busy={logoutLoading} disabled={logoutLoading}>
				Abmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" />
			</button>
		</form>
	{:else}
		<a href="/register" class="button">
			Account erstellen <iconify-icon icon="material-symbols:arrow-forward-rounded" />
		</a>
		<span class="lines-green-800 my-2 max-w-lg text-sm">Oder</span>
		<a href="#login" class="button">
			Anmelden <iconify-icon icon="material-symbols:arrow-downward-rounded" />
		</a>
	{/if}
</section>

<section>
	<h4>Erkunde die Welt von <span class="text-green-700">Second Hand</span>:</h4>
	<div style:--columns={categoryColumns} class="fade relative mt-4 flex h-[60vh] max-w-5xl overflow-hidden">
		{#each Array(categoryColumns) as _, column}
			<div class="move relative mx-2 h-fit w-full">
				{#each Array(2) as _, section}
					{#each computeRelevantCategories(column, categoryColumns) as { id, image, icon, name }}
						<a
							href={`/shop?category=${id}`}
							tabindex={section === 0 ? 0 : -1}
							class="relative my-4 block rounded-3xl border-black shadow-4 transition-transform last:mb-0 hover:scale-[1.02] hover:bg-neutral-500 focus:scale-[1.02] focus:bg-neutral-500 active:border active:shadow-3"
						>
							<img src={`/images/${image}.webp`} alt={name} class="w-full rounded-3xl opacity-50" />
							<span class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
								<iconify-icon {icon} />
								{name}
							</span>
						</a>
					{/each}
				{/each}
			</div>
		{/each}
	</div>
</section>

<section>
	<div class="w-min whitespace-nowrap">
		<h3>Wieso aber <span class="text-green-700">Second Hand</span>?</h3>
		<span class="line-green-800 mb-4" />
	</div>
	Mit Second Hand Angeboten sparst du nicht nur viel Geld, sondern tust dabei auch noch etwas gutes für die Umwelt!
	<div class="fade-horizontal relative mt-4 flex h-[60vh] overflow-hidden">
		<div class="move-horizontal relative mx-2 h-fit w-full">
			{#each Array(2) as _, section}
				{#each Array(10) as _}
					<!-- <a
						href={`/shop?category=${id}`}
						tabindex={section === 0 ? 0 : -1}
						class="relative my-4 block rounded-3xl border-black shadow-4 transition-transform last:mb-0 hover:scale-[1.02] hover:bg-neutral-500 focus:scale-[1.02] focus:bg-neutral-500 active:border active:shadow-3"
					>
						<img src={`/images/${image}.webp`} alt={name} class="w-full rounded-3xl opacity-50" />
						<span class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
							<iconify-icon {icon} />
							{name}
						</span>
					</a> -->
				{/each}
			{/each}
		</div>
	</div>
	<!-- <div class="overflow-hidden mt-4 h-[21vw] fade relative" on:mouseenter="pause" on:mouseleave="run">
      <div class="absolute flex items-center move">
        <img
          v-for="image in data"
          :src="useFormatImage(image.image)"
          class="m-2 h-[20vw] rounded-3xl hover:scale-[1.02] transition-transform cursor-pointer"
          ref="imagesRef"
          @click="useNavigateTo(`/offers/${image.id}`)"
        />
        <img
          v-for="image in data"
          :src="useFormatImage(image.image)"
          class="m-2 h-[20vw] rounded-3xl hover:scale-[1.02] transition-transform cursor-pointer"
          @click="useNavigateTo(`/offers/${image.id}`)"
        />
      </div>
    </div> -->
</section>

{#if passwordResetModal}<PasswordResetModal {name} {form} on:close={() => (passwordResetModal = false)} />{/if}
{#if forgotNameModal}<ForgotNameModal {form} on:close={() => (forgotNameModal = false)} />{/if}

{#if !data.user}
	<section id="login">
		<h2>Willkommen zurück!</h2>
		<form method="POST" action="?/login" use:enhance={submitLogin} class="mt-6 grid gap-3">
			<input name="name" required minlength="3" autocomplete="username" bind:value={name} placeholder="Nutzername" />
			<div class="flex items-center">
				<input
					name="password"
					type={passwordVisible ? 'text' : 'password'}
					required={passwordRequired}
					minlength="6"
					autocomplete="current-password"
					placeholder="Passwort"
				/>
				<button
					type="button"
					on:click={() => (passwordVisible = !passwordVisible)}
					aria-label={passwordVisible ? 'Passwort verstecken' : 'Passwort anzeigen'}
					class="button-hidden relative right-12 h-[30px]"
				>
					<iconify-icon
						icon={passwordVisible
							? 'material-symbols:visibility-off-outline-rounded'
							: 'material-symbols:visibility-outline-rounded'}
					/>
				</button>
			</div>
			<p class="error -mb-2">{form?.loginError ?? ''}</p>
			<button aria-busy={loginLoading} disabled={loginLoading} on:click={() => (passwordRequired = true)}>
				Anmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" />
			</button>
			<div class="mt-2 flex">
				<button type="button" on:click={() => (forgotNameModal = true)} class="!w-min text-xl">
					Nutzername vergessen?
				</button>
				<span class="line-vertical-black mx-4" />
				<button formaction="forgotPassword" on:click={() => (passwordRequired = false)} class="!w-min text-xl">
					Passwort vergessen?
				</button>
			</div>
		</form>
	</section>
{/if}

<style lang="postcss">
	.fade:before {
		@apply pointer-events-none absolute z-10 h-full w-full;
		content: '';
		background: linear-gradient(theme(colors.neutral.50), transparent 3%, transparent 97%, theme(colors.neutral.50));
	}
	.fade-horizontal:before {
		@apply pointer-events-none absolute z-10 h-full w-full;
		content: '';
		background: linear-gradient(
			90deg,
			theme(colors.neutral.50),
			transparent 3%,
			transparent 97%,
			theme(colors.neutral.50)
		);
	}

	@keyframes move {
		to {
			transform: translateY(-50%);
		}
	}
	.move {
		animation: move calc((9 / var(--columns)) * 10s) linear infinite;
	}
	.move:hover {
		animation-play-state: paused;
	}
</style>
