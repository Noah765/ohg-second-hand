<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Underlined from '$lib/components/Underlined.svelte';
	import VerificationModal from './VerificationModal.svelte';

	export let data;
	$: ({ supabase } = data);

	let name = '';
	let email = '';
	let password = '';
	let passwordVisible = false;

	let loading = false;
	let error = '';
	async function register() {
		loading = true;
		error = '';

		const { data: emailUsed, error: checkEmailUsedError } = await supabase.rpc('is_email_used', { email });
		if (checkEmailUsedError) {
			error = checkEmailUsedError.message;
			return;
		}

		if (emailUsed) {
			goto(`/?login=${email}`);
			return;
		}

		const {
			data: { session },
			error: registerError
		} = await supabase.auth.signUp({ email, password, options: { data: { name } } });

		loading = false;

		if (registerError) {
			error = registerError.message;
			return;
		}
		if (session) {
			goto('/');
			return;
		}

		goto(`?verification=${email}`);
	}
</script>

{#if $page.url.searchParams.has('verification')}<VerificationModal {supabase} />{/if}

<section>
	<h2><Underlined>Account erstellen</Underlined></h2>
	<form method="POST" on:submit|preventDefault={register} class="mt-6 grid gap-3">
		<input bind:value={name} required minlength="3" autocomplete="username" placeholder="Nutzername" />
		<input bind:value={email} type="email" required placeholder="E-Mail-Adresse" />
		<div class="mb-3 flex items-center">
			<input
				on:input={(e) => (password = e.currentTarget.value)}
				type={passwordVisible ? 'text' : 'password'}
				required
				minlength="6"
				autocomplete="new-password"
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
		<button aria-busy={loading} disabled={loading}>
			Registrieren<iconify-icon icon="material-symbols:arrow-forward-rounded" />
		</button>
		<p class="error">{error}</p>
	</form>

	<span class="line-green-800 mb-4 mt-10 w-96" />
	<h4 class="mb-4">Anders überlegt?</h4>
	<a href="/" class="button">Zurück zur Startseite<iconify-icon icon="material-symbols:arrow-back-rounded" /></a>
</section>
