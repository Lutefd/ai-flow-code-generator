<script lang="ts">
	import { useChat } from 'ai/svelte';
	import { m2 } from '../store/stores';
	import AiMessage from '../components/AiMessage.svelte';
	import { goto } from '$app/navigation';
	const { messages, handleSubmit, input } = useChat({
		api: '/chat'
	});
	$: exportConversation = async () => {
		$m2 = $messages;
		goto('/DS');
	};
</script>

<ul>
	{#each $messages as message}
		{#if message.role === 'user'}
			<li>you said: {message.content}</li>
		{/if}
		{#if message.role === 'assistant'}
			<li>bot says: <AiMessage message={message.content} /></li>
		{/if}
	{/each}
</ul>
<form on:submit={handleSubmit}>
	<input bind:value={$input} />
	<button type="submit">Send</button>
</form>
<button on:click={exportConversation}>Export this conversation</button>
