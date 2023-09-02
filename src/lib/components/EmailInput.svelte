<script lang="ts">
	export let value: string;
</script>

<div class="flex items-center">
	<input bind:value required placeholder="E-Mail-Adresse" class="pr-60" />
	<span class="pointer-events-none relative right-60 w-0 whitespace-nowrap opacity-50">@ohg-monheim.eu</span>
</div>
