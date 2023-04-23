<script lang="ts">
	import { invalidate } from '$app/navigation';
	import '../app.css';
	import Alerts, { type AlertsType } from './Alerts.svelte';
	import Sidebar from './Sidebar.svelte';
	import 'iconify-icon';
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	setContext('alerts', writable<AlertsType>([]));

	export let data;

	$: ({ supabase, session } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div class="grid grid-cols-[min-content_auto] gap-4">
	<Alerts />

	<Sidebar />

	<div>
		<main><slot /></main>

		<footer>
			<!-- <p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p> -->
			FOOTER
		</footer>
	</div>
</div>
