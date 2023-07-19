<script lang="ts">
	import type { PageData } from './$types';
	import { m2 } from '../../store/stores';
	m2.subscribe((value) => {});
</script>

<h1>Conversa exportada em MD</h1>
{#each $m2 as message}
	<li>{message.role} says: {message.content}</li>
{/each}
<ul />
