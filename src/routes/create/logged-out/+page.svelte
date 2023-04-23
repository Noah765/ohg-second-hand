<script lang="ts">
	import Underlined from '$lib/components/Underlined.svelte';
</script>

<section>
	<h2><Underlined>Angebot erstellen</Underlined></h2>
</section>

<section class="flex h-[80vh] flex-col items-center justify-center">
	<h4 class="mb-8">Anmeldung erforderlich</h4>
	Melde dich an, um Angebote erstellen zu können:
	<a href="/register" class="button mt-4">
		Account erstellen<iconify-icon icon="material-symbols:arrow-forward-rounded" />
	</a>
	<span class="lines-green-800 my-2 w-full max-w-lg text-sm">Oder</span>
	<a href="/#login" class="button">Anmelden<iconify-icon icon="material-symbols:arrow-forward-rounded" /></a>
</section>
