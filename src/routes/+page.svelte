<script lang="ts">
	import { useChat } from 'ai/svelte';
	import { m2 } from '../store/stores';
	import AiMessage from '../components/AiMessage.svelte';
	import { goto } from '$app/navigation';
	import { afterUpdate } from 'svelte';

	const { messages, handleSubmit, input, isLoading } = useChat({
		api: '/chat',
		onResponse: (response) => {},
		body: {
			department: 'sales',
			product: 'shoes'
		}
	});
	$: exportConversation = async () => {
		$m2 = $messages;
		goto('/DS');
	};
	let canvas: HTMLElement;
	const scrollToBottom = async (node: HTMLElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};
	afterUpdate(() => {
		if (messages) scrollToBottom(canvas);
	});
	$: if (messages && canvas) {
		scrollToBottom(canvas);
	}
</script>

<div class="grid max-h-[48rem] overflow-y-scroll w-screen place-items-center" bind:this={canvas}>
	<div class="w-96 md:w-[32rem]">
		<ul>
			{#each $messages as message}
				{#if message.role === 'user'}
					<li>
						<div class="chat chat-start">
							<div class="chat-bubble">{message.content}</div>
						</div>
					</li>
				{/if}
				{#if message.role === 'assistant'}
					<li>
						<div class="chat chat-end max-w-xl">
							<div class="chat-bubble"><AiMessage message={message.content} /></div>
						</div>
					</li>{/if}
			{/each}
		</ul>
	</div>
</div>
<div class="w-screen flex justify-center">
	<form on:submit={handleSubmit} class="absolute bottom-5">
		<div class="flex gap-4">
			<input bind:value={$input} class="input input-bordered input-secondary w-full max-w-xs" />
			<button type="submit" class="btn-secondary w-32 rounded-lg" disabled={$isLoading}>Send</button
			>
		</div>
	</form>
</div>

<style>
	::-webkit-scrollbar {
		width: 0.4rem;
	}
	::-webkit-scrollbar-thumb {
		background-color: #888;
		border-radius: 1rem;
	}
</style>
