<script lang="ts">
	export let options: any[] = [];
	export let display_func = (a: any) => a;
	export let index = 0;
	export let value;
	export let which;
	export let section: string;
	export let onSelect: (a?: any) => void;

	$: {
		value = options[index];
	}
	$: if (index !== -1) {
		which = false;
		onSelect();
	}
</script>

<select bind:value={index} class="select select-secondary w-full max-w-xs">
	<option value={-1}>Select an {section}</option>
	{#each options as option, i}
		<option value={i}>{display_func(option)}</option>
	{/each}
</select>
