<script lang="ts">
	import { onMount } from 'svelte';

	let pageWidth: number;

	let text: HTMLSpanElement;
	let textStyle: CSSStyleDeclaration;
	let words: string[];

	let lines: number[] = [];
	let linesContent: string[];

	onMount(() => {
		textStyle = window.getComputedStyle(text);
		words = text.textContent?.split(' ') ?? [];
	});

	$: if (pageWidth) document.fonts.ready.then(calculateLinesWidths);

	function calculateLinesWidths() {
		const newLinesContent: string[] = [];

		text.textContent = words[0];

		let lineStartIndex = 0;
		let height = text.offsetHeight;
		for (let i = 1; i < words.length; i++) {
			text.textContent = `${text.textContent} ${words[i]}`;

			if (text.offsetHeight > height) {
				newLinesContent.push(words.slice(lineStartIndex, i).join(' '));
				lineStartIndex = i;
				height = text.offsetHeight;
			}
		}
		newLinesContent.push(words.slice(lineStartIndex).join(' '));

		if (linesContent && linesContent.every((line, index) => line === newLinesContent[index])) return;
		linesContent = newLinesContent;

		const context = document.createElement('canvas').getContext('2d');
		if (!context) return;
		context.font = `${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`;

		lines = [];
		linesContent.forEach((line) => lines.push(context.measureText(line).width));
	}
</script>

<svelte:window bind:innerWidth={pageWidth} />

<span class="relative block">
	{#each lines as lineWidth, index}
		<span
			style:top={`${(text.offsetHeight / lines.length) * (index + 1) - 7}px`}
			style:width={`${lineWidth}px`}
			class="absolute h-1 rounded-full bg-green-800"
		/>
	{/each}
</span>

<span bind:this={text} class="block"><slot /></span>
