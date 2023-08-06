<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { formatImage } from '$lib/format';
	import type { WritableAlerts } from './Alerts.svelte';
	import ResetPasswordModal from './ResetPasswordModal.svelte';
	import type { PostgrestSingleResponse } from '@supabase/supabase-js';
	import { getContext, onMount } from 'svelte';

	export let data;
	$: ({ supabase, user, offerImages } = data);

	const alerts: WritableAlerts = getContext('alerts');

	if ($page.url.hash.includes('error')) {
		const alertId = Symbol();
		alerts.update((oldAlerts) => [
			...oldAlerts,
			{
				id: alertId,
				color: 'red',
				icon: 'material-symbols:error-circle-rounded-outline',
				title: 'Fehler',
				description: 'Das Verifizierungs-Token ist ungültig oder abgelaufen. ',
				action: {
					text: 'E-Mail erneut senden',
					function: () => {
						goto('?verification');
						alerts.update((oldAlerts) => oldAlerts.filter((alert) => alert.id !== alertId));
					}
				}
			}
		]);
	}

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

	let offerImagesRef: HTMLImageElement[] = [];
	let offerImagesWidth = 0;

	onMount(() => {
		if ($page.url.searchParams.has('login')) setTimeout(() => gotoLogin(), 400);

		const { data } = supabase.auth.onAuthStateChange((event) => {
			if (event === 'PASSWORD_RECOVERY') resetPasswordModal = 'password';
		});

		const promises = offerImagesRef.map(
			(image) => new Promise<number>((resolve) => (image.onload = () => resolve(image.width)))
		);
		Promise.all(promises).then(
			(widths) => (offerImagesWidth = widths.reduce((previous, current) => previous + current + 16, 0))
		);
		setTimeout(() => {
			if (offerImagesWidth === 0 && offerImagesRef.length > 0 && offerImagesRef[0] !== null)
				offerImagesWidth = offerImagesRef.reduce(
					(previous, currentRef) => previous + currentRef.getBoundingClientRect().width + 16,
					0
				);
		}, 3000);

		return () => data.subscription.unsubscribe();
	});

	let resetPasswordModal: null | 'email' | 'password' = null;

	let email = '';
	let password = '';
	let passwordVisible = false;

	function gotoLogin() {
		window.scrollTo(0, 2000);

		const urlEmail = $page.url.searchParams.get('login');
		if (urlEmail) email = urlEmail;
	}

	const updateBlock: () => void = getContext('updateBlock');

	let loginLoading = false;
	let loginError = '';
	async function login() {
		loginLoading = true;
		loginError = '';

		const { data: userBlocked, error: checkUserBlockedError } = (await supabase.rpc('get_user_blocked', {
			email,
			password
		})) as PostgrestSingleResponse<{ username: string; until: number; description: string }>;

		if (checkUserBlockedError) {
			loginLoading = false;
			loginError = checkUserBlockedError.message;
			return;
		}
		if (userBlocked.username) {
			loginLoading = false;
			localStorage.setItem(
				'block',
				JSON.stringify({
					username: userBlocked.username,
					description: userBlocked.description,
					until: userBlocked.until
				})
			);
			updateBlock();
			return;
		}

		localStorage.removeItem('block');

		const { error } = await supabase.auth.signInWithPassword({ email, password });

		loginLoading = false;
		if (error) loginError = error.message;
		else goto('/');
	}

	let logoutLoading = false;
	let logoutError = '';
	async function logout() {
		logoutLoading = true;
		logoutError = '';

		const { error } = await supabase.auth.signOut();

		logoutLoading = false;
		if (error) logoutError = error.message;
	}
</script>

<svelte:window bind:innerWidth={pageWidth} />

<section>
	<h1 class="mb-8">
		Second Hand<br />
		<span class="text-8xl leading-tight text-green-700">leicht</span><br />
		gemacht
	</h1>

	{#if user}
		<form on:submit|preventDefault={logout}>
			<p class="error">{logoutError}</p>
			<button aria-busy={logoutLoading} disabled={logoutLoading}>
				Abmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" />
			</button>
		</form>
	{:else}
		<a href="/register" class="button">
			Account erstellen <iconify-icon icon="material-symbols:arrow-forward-rounded" />
		</a>
		<span class="lines-green-800 my-2 max-w-lg text-sm">Oder</span>
		<button on:click={gotoLogin}>
			Anmelden <iconify-icon icon="material-symbols:arrow-downward-rounded" />
		</button>
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
							href="/shop?categories={id}"
							tabindex={section === 0 ? 0 : -1}
							class="relative my-4 block rounded-3xl border-black shadow-4 transition-transform last:mb-0 hover:scale-[1.02] hover:bg-neutral-500 focus:scale-[1.02] focus:bg-neutral-500 active:border active:shadow-3"
						>
							<img src="/images/{image}.webp" alt={name} class="w-full rounded-3xl opacity-50" />
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

{#if offerImages.length >= 5}
	<section>
		<div class="w-min whitespace-nowrap">
			<h3>Wieso aber <span class="text-green-700">Second Hand</span>?</h3>
			<span class="line-green-800 mb-4" />
		</div>
		Mit Second Hand Angeboten sparst du nicht nur viel Geld, sondern tust dabei auch noch etwas Gutes für die Umwelt!
		<div class="fade-horizontal relative mt-4 h-[21vw] overflow-x-hidden">
			<div style:--move="-{offerImagesWidth}px" class="move-horizontal flex h-full items-center">
				{#each Array(2) as _, section}
					{#each offerImages as { offer, image }, index}
						<a
							href="offers/{offer}"
							tabindex={section === 0 ? 0 : -1}
							class="mx-2 h-[20vw] min-w-fit transition-transform last:mr-0 hover:scale-[1.02]"
						>
							<img
								bind:this={offerImagesRef[index]}
								src={formatImage(image, 'offer_images')}
								alt="Bild eines Angebots {index + 1}"
								class="h-full rounded-3xl"
							/>
						</a>
					{/each}
				{/each}
			</div>
		</div>
	</section>
{/if}

{#if resetPasswordModal}
	<ResetPasswordModal type={resetPasswordModal} {supabase} {email} on:close={() => (resetPasswordModal = null)} />
{/if}

{#if !user}
	<section>
		<h2>Willkommen zurück!</h2>
		<form method="POST" on:submit|preventDefault={login} class="mt-6 grid gap-3">
			<input bind:value={email} type="email" required placeholder="E-Mail-Adresse" />
			<div class="flex items-center">
				<input
					on:input={(e) => (password = e.currentTarget.value)}
					type={passwordVisible ? 'text' : 'password'}
					required
					minlength="6"
					autocomplete="current-password"
					placeholder="Passwort"
				/>
				<button
					type="button"
					on:click={() => (passwordVisible = !passwordVisible)}
					aria-label={passwordVisible ? 'Passwort verstecken' : 'Passwort anzeigen'}
					class="button-hidden relative right-12 h-[30px] w-0"
				>
					<iconify-icon
						icon={passwordVisible
							? 'material-symbols:visibility-off-outline-rounded'
							: 'material-symbols:visibility-outline-rounded'}
					/>
				</button>
			</div>
			<p class="error -mb-2">{loginError}</p>
			<button aria-busy={loginLoading} disabled={loginLoading}>
				Anmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" />
			</button>
		</form>
		<button on:click={() => (resetPasswordModal = 'email')} class="mt-6 text-xl">Passwort vergessen?</button>
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
		0% {
			transform: none;
		}
		100% {
			transform: translateY(-50%);
		}
	}
	.move {
		animation: move calc((9 / var(--columns)) * 10s) linear infinite;
		animation-play-state: running;
	}
	.move:hover {
		animation-play-state: paused;
	}

	@keyframes move-horizontal {
		to {
			transform: translateX(var(--move));
		}
	}
	.move-horizontal {
		animation: move-horizontal 30s linear infinite;
		animation-play-state: running;
	}
	.move-horizontal:hover {
		animation-play-state: paused;
	}
</style>
