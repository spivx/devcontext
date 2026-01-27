---
name: Svelte Component Generator
description: Scaffold a Svelte 5 component (Runes mode).
dependencies: "svelte"
---

## Guidelines
- Use Svelte 5 syntax (Runes) if applicable, or standard Svelte 3/4.
- Use \`$props()\` and \`$state()\` for Svelte 5.
- Scoped styles by default.

## Template (Svelte 5)
\`\`\`svelte
<script lang="ts">
	let { title, count = 0, onupdate }: { title: string, count?: number, onupdate?: (n: number) => void } = $props();

	let doubled = $derived(count * 2);

	function handleClick() {
		if (onupdate) onupdate(count + 1);
	}
</script>

<div class="card">
	<h2>{title}</h2>
	<p>Value: {count} (2x: {doubled})</p>
	<button onclick={handleClick}>Update</button>
</div>

<style>
	.card {
		padding: 1rem;
		border-radius: 8px;
		background: #f5f5f5;
	}
</style>
\`\`\`
