<script lang="ts">
	import { page } from '$app/stores';
</script>

<section>
	<h1 class="mb-6">Fehler</h1>
	{#if $page.status === 404}
		<h4 class="mb-2">Die angeforderte Seite wurde nicht gefunden</h4>
		<p>URL: {$page.url}</p>
	{:else}
		<p class="mb-6 text-3xl">Ein unerwarteter Fehler ist aufgetreten</p>
		<p class="text-3xl">Nachricht:</p>
		<pre class="mb-6 mt-2 text-xl">{$page.error?.name ?? $page.error?.message}</pre>
		<p class="text-3xl">Details:</p>
		<pre class="mt-2 text-xl">{$page.error?.details ?? $page.error?.message}</pre>
	{/if}
	<a href="/" class="button mt-10">Zur Startseite<iconify-icon icon="material-symbols:arrow-back-rounded" /></a>
</section>
