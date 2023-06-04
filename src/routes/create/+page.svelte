<script lang="ts">
	import Underlined from '$lib/components/Underlined.svelte';
	import CreateBody from './CreateBody.svelte';
	import CreateLoggedOut from './CreateLoggedOut.svelte';

	export let data;
	$: ({ supabase, user } = data);
</script>

<section>
	<h2><Underlined>Angebot erstellen</Underlined></h2>
</section>

{#if user}
	<CreateBody {supabase} userId={user.id} />
{:else}
	<CreateLoggedOut />
{/if}
