<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Underlined from '$lib/components/Underlined.svelte';
	import type { WritableAlerts } from '../Alerts.svelte';
	import type { SubmitFunction } from './$types';
	import VerificationModal from './VerificationModal.svelte';
	import { getContext } from 'svelte';

	export let data;
	const alerts: WritableAlerts = getContext('alerts');
	if (data.error) {
		let description: string;
		switch (data.error) {
			case 'EXPIRED_TOKEN':
				description = 'Das Verifizierungs-Token ist abgelaufen. ';
				break;
			case 'INVALID_TOKEN':
				description = 'Das Verifizierungs-Token ist ungültig. ';
				break;
			default:
				description = 'Unerwarteter Fehler bei der Überprüfung des Verifizierungs-Tokens. ';
				break;
		}

		const alertId = Symbol();
		alerts.update((oldAlerts) => [
			...oldAlerts,
			{
				id: alertId,
				color: 'red',
				icon: 'material-symbols:error-circle-rounded-outline',
				title: 'Fehler',
				description: description,
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

	export let form;

	let passwordVisible = false;

	let registerLoading = false;
	const register: SubmitFunction = () => {
		registerLoading = true;
		return async ({ update }) => {
			await update();
			registerLoading = false;
		};
	};
</script>

<svelte:head>
	<title>Registrierung - OHG Second Hand</title>
	<meta name="description" content="Registrierung der OHG Second Hand Webseite" />
</svelte:head>

{#if $page.url.searchParams.has('verification')}<VerificationModal {form} />{/if}

<section>
	<h2><Underlined>Account erstellen</Underlined></h2>
	<form method="POST" action="?/register" use:enhance={register} class="mt-6 grid gap-3">
		<input
			name="name"
			required
			minlength="3"
			autocomplete="username"
			value={form?.registerData?.name ?? ''}
			placeholder="Nutzername"
		/>
		<input name="email" type="email" required value={form?.registerData?.email ?? ''} placeholder="E-Mail-Adresse" />
		<div class="mb-3 flex items-center">
			<input
				name="password"
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
				class="button-hidden relative right-12 h-[30px]"
			>
				<iconify-icon
					icon={passwordVisible
						? 'material-symbols:visibility-off-outline-rounded'
						: 'material-symbols:visibility-outline-rounded'}
				/>
			</button>
		</div>
		<button aria-busy={registerLoading} disabled={registerLoading}>
			Registrieren<iconify-icon icon="material-symbols:arrow-forward-rounded" />
		</button>
		<p class="error">{form?.registerError ?? ''}</p>
	</form>

	<span class="line-green-800 mb-4 mt-10 w-96" />
	<h4 class="mb-4">Anders überlegt?</h4>
	<a href="/" class="button">Zurück zur Startseite<iconify-icon icon="material-symbols:arrow-back-rounded" /></a>
</section>
