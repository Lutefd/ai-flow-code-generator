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

<select
	bind:value={index}
	class="select text-white border-white bg-[#37474F] outline-[#37474F] w-full max-w-xs"
>
	<option value={-1}>{section}</option>
	{#each options as option, i}
		<option class="text-white" value={i}>{display_func(option)}</option>
	{/each}
</select>
