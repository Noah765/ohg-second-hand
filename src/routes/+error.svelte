<script lang="ts">
	import { page } from '$app/stores';
</script>

<section>
	<h1>Fehler</h1>
	<p class="mb-6 mt-6 text-3xl">Ein unerwarteter Fehler ist aufgetreten</p>
	<p class="text-3xl">Nachricht:</p>
	<pre class="mb-6 mt-2 text-xl">{$page.error?.name ?? $page.error?.message}</pre>
	<p class="text-3xl">Details:</p>
	<pre class="mt-2 text-xl">{$page.error?.details ?? $page.error?.message}</pre>
</section>
