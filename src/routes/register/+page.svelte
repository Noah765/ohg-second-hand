<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EmailInput from '$lib/components/EmailInput.svelte';
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

		const { data: emailUsed, error: checkEmailUsedError } = await supabase.rpc('is_email_used', {
			email: email + '@ohg-monheim.eu'
		});
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
		} = await supabase.auth.signUp({ email: email + '@ohg-monheim.eu', password, options: { data: { name } } });

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
		<EmailInput bind:value={email} />
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
		<label class="group flex max-w-lg cursor-pointer">
			<input
				type="checkbox"
				required
				class="peer mr-4 h-9 w-9 rounded-lg border-black shadow-3 group-hover:bg-neutral-100 group-active:mr-[15.2px] group-active:border group-active:shadow-2"
			/>
			<iconify-icon
				icon="material-symbols:check-small-rounded"
				class="absolute text-4xl text-transparent transition-colors peer-checked:text-black"
			/>
			<span class="text-sm">
				Ich akzeptiere die <a href="/legal/terms" class="underline">Allgemeinen Geschäftsbedingungen</a> und habe die
				<a href="/legal/privacy" class="underline">Datenschutzerklärung</a>
				zur Kenntnis genommen
			</span>
		</label>
		<button aria-busy={loading} disabled={loading}>
			Registrieren<iconify-icon icon="material-symbols:arrow-forward-rounded" />
		</button>
		<p class="error">{error}</p>
	</form>

	<span class="line-green-800 mb-4 mt-10 w-96" />
	<h4 class="mb-4">Anders überlegt?</h4>
	<a href="/" class="button">Zurück zur Startseite<iconify-icon icon="material-symbols:arrow-back-rounded" /></a>
</section>
