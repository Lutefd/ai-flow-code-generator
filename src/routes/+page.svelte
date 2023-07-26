<script lang="ts">
	import { useChat } from 'ai/svelte';
	import { m2, qna } from '../store/stores';
	import AiMessage from '../components/AiMessage.svelte';
	import { afterUpdate, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { enhance } from '$app/forms';
	import Select from '../components/Select.svelte';
	import type { Apps } from '../types/Interfaces';
	let department = writable<Apps>();
	$: selectedDepartment = $department;
	const { messages, handleSubmit, input, isLoading } = useChat({
		api: '/chat',
		onResponse: (response) => {},
		body: {
			department: selectedDepartment
		}
	});
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
	let formload = false;
	let setupComplete = false;
	let invalidq1 = false;
	let appsList: unknown;
	function updateAppsList(apps: unknown) {
		appsList = apps as Apps[];
	}
	function updateInvalidQ1() {
		qna.update((qna) => {
			qna = [
				...qna,
				{
					role: 'assistant',
					content: `Perfeito! O departamento escolhido foi ${$department.name}. Em qual linguagem gostaria de gerar o código? Deseja adicionar mais alguma informação?`
				}
			];
			return qna;
		});
		setupComplete = true;
	}
	onMount(async () => {
		qna.update((qna) => {
			qna = [
				{
					role: 'assistant',
					content:
						'Olá. Para lhe auxliar no fluxo de criação de produtos da netshoes preciso de algumas informações.'
				},
				{
					role: 'assistant',
					content:
						'Primeiro, em qual departamento o produto deve ser criado? Responda apenas com o nome dele por favor.'
				}
			];
			return qna;
		});
	});
</script>

<svelte:head>
	<title>Teste de Modelo - AI SENSEDIA</title>
</svelte:head>
<div class="grid max-h-[48rem] overflow-y-scroll w-screen place-items-center" bind:this={canvas}>
	<div class="w-96 md:w-[32rem] pb-12 md:pb-0">
		<ul>
			{#each $qna as message}
				{#if message.role === 'assistant'}
					<li>
						<div class="chat chat-start max-w-xl">
							<div class="chat-bubble">
								{#if message.type === 'select'}
									<Select
										options={message.content}
										display_func={(o) => o.name}
										index={-1}
										section="department"
										onSelect={updateInvalidQ1}
										bind:which={invalidq1}
										bind:value={$department}
									/>
								{:else}
									<AiMessage message={message.content} />
								{/if}
							</div>
						</div>
					</li>{/if}
				{#if message.role === 'user'}
					<li>
						<div class="chat chat-end">
							<div class="chat-bubble">{message.content}</div>
						</div>
					</li>
				{/if}
			{/each}

			{#each $messages as message}
				{#if message.role === 'assistant'}
					<li>
						<div class="chat chat-start max-w-xl">
							<div class="chat-bubble"><AiMessage message={message.content} /></div>
						</div>
					</li>{/if}
				{#if message.role === 'user'}
					<li>
						<div class="chat chat-end">
							<div class="chat-bubble">{message.content}</div>
						</div>
					</li>
				{/if}
			{/each}
		</ul>
	</div>
</div>
<div class="w-screen flex justify-center">
	{#if formload == true || $isLoading || invalidq1 == true}
		<div class="absolute bottom-5">
			<span class="loading loading-dots loading-lg" />
		</div>
	{:else if setupComplete}
		<form on:submit={handleSubmit} class="absolute bottom-5">
			<div class="flex gap-4">
				<input
					bind:value={$input}
					name="answer"
					class="input input-bordered input-secondary w-full max-w-xs"
				/>
				<button type="submit" class="btn-secondary w-32 rounded-lg" disabled={$isLoading}
					>Send</button
				>
			</div>
		</form>
	{:else if $qna.length < 3}
		<form
			method="POST"
			action="?/validateq1"
			use:enhance={({ formData }) => {
				const a1 = formData.get('a1');
				qna.update((qna) => {
					qna = [
						...qna,
						{
							role: 'user',
							content: a1
						}
					];
					return qna;
				});
				formload = true;
				console.log(formload);
				return ({ result, update }) => {
					console.log(result);
					console.log($department);
					if (result.type == 'success') {
						//@ts-ignore
						$department = result.data?.app;
						formload = false;
						console.log($department);
						console.log(formload);
						qna.update((qna) => {
							qna = [
								...qna,
								{
									role: 'assistant',
									content: `Perfeito! O departamento escolhido foi ${$department.name}. Em qual linguagem gostaria de gerar o código? Deseja adicionar mais alguma informação?`
								}
							];
							return qna;
						});
						setupComplete = true;
					}
					if (result.type == 'failure') {
						formload = false;
						console.log(formload);
						invalidq1 = true;
						updateAppsList(result.data?.apps);
						qna.update((qna) => {
							qna = [
								...qna,
								{
									role: 'assistant',
									content:
										'Não consegui encontrar o departamento que você digitou. Por favor, escolha um dos departamentos abaixo.'
								},
								{
									role: 'assistant',
									type: 'select',
									content: appsList
								}
							];
							return qna;
						});
					}
					update();
				};
			}}
			class="absolute bottom-5"
		>
			<div class="flex gap-4">
				<input
					bind:value={$department}
					name="a1"
					autocomplete="off"
					class="input input-bordered input-secondary w-full max-w-xs"
				/>
				<button type="submit" class="btn-secondary w-32 rounded-lg" disabled={$isLoading}
					>Send</button
				>
			</div>
		</form>
		<!-- {:else if $qna[2] && $qna[2].role === 'user'}
		<form method="POST" action="?/validateq2" class="absolute bottom-5">
			<div class="flex gap-4">
				<input
					bind:value={$input}
					name="answer"
					class="input input-bordered input-secondary w-full max-w-xs"
				/>
				<button type="submit" class="btn-secondary w-32 rounded-lg" disabled={$isLoading}
					>Send q2</button
				>
			</div>
		</form> -->
	{/if}
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
