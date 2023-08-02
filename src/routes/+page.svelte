<script lang="ts">
	import ZeChat from '../assets/ze_uni.jpg';
	import { m2, qna } from '../store/stores';
	import AiMessage from '../components/AiMessage.svelte';
	import { afterUpdate, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { enhance } from '$app/forms';
	import Select from '../components/Select.svelte';
	import type { Departments } from '../types/Interfaces';
	import MultiSelect from 'svelte-multiselect';
	let department = writable<Departments>();
	let product = writable<Departments>();
	let attributes = writable<any[]>();
	let formload = false;
	let setupComplete = false;
	let invalidq1 = false;
	let invalidq2 = false;
	let invalidq3 = false;
	let q1 = true;
	let q2 = false;
	let q3 = false;
	let initialPrompt = true;
	let departmentsList: unknown;
	let productsList: unknown;
	let attributesList: unknown;
	let canvas: HTMLElement;
	let input = writable<string>();
	let isLoading = writable<boolean>(false);
	const scrollToBottom = async (node: HTMLElement, option: ScrollBehavior) => {
		node.scroll({ top: node.scrollHeight, behavior: option });
	};
	$: if ($qna && canvas) {
		scrollToBottom(canvas, 'instant');
	}
	function updateDepartmentsList(departments: unknown) {
		departmentsList = departments as Departments[];
	}
	function updateProductsList(products: unknown) {
		productsList = products as Departments[];
	}
	function updateAttributesList(attributes: unknown) {
		attributesList = attributes as Departments[];
	}

	async function fetchMessages(stageURL: string) {
		isLoading.set(true);
		const response = await fetch(stageURL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				department: $department,
				product: $product,
				messages: $qna,
				attributes: $attributes
			})
		});

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error('Response body is null');
		}

		const message = {
			role: 'assistant',
			content: ''
		};

		qna.update((oldMessages) => [...oldMessages, message]);

		let lastUpdateIndex = $qna.length - 1;

		async function readStream(): Promise<void> {
			if (!reader) return;
			const { done, value } = await reader.read();
			if (done) {
				isLoading.set(false);
				return;
			}

			const textChunk = new TextDecoder().decode(value);
			message.content += textChunk;

			qna.update((oldMessages) => {
				oldMessages[lastUpdateIndex] = { ...message };
				return [...oldMessages];
			});

			return await readStream();
		}
		initialPrompt = false;
		await readStream();
	}
	async function handleSubmit(event: Event, stageURL: string) {
		event.preventDefault();
		const restartPattern = /reinicie o fluxo|recomece o fluxo/;
		if ($input.toLocaleLowerCase().match(restartPattern)) {
			window.location.reload();
		}
		if ($input) {
			qna.update((qna) => {
				qna = [
					...qna,
					{
						role: 'user',
						content: $input
					}
				];
				return qna;
			});
			$input = '';
			await fetchMessages(stageURL);
		}
	}
	async function updateInvalidQ1() {
		qna.update((qna) => {
			qna = [
				...qna,
				{
					role: 'assistant',
					content: `Perfeito! O departamento escolhido foi ${$department.name}. Agora escolha o tipo de produto que deseja cadastrar`
				}
			];
			return qna;
		});
		q2 = true;
	}
	async function updateInvalidQ2() {
		qna.update((qna) => {
			qna = [
				...qna,
				{
					role: 'assistant',
					content: `Perfeito! O tipo de produto escolhido foi ${$product.name}. Quais serão os atributos do seu produto?`
				}
			];
			return qna;
		});
		q3 = true;
	}
	async function updateInvalidQ3() {
		const selectedNames = $attributes.map((item: any) => item.label);
		const selectedNamesString = selectedNames.join(', ');

		qna.update((qna) => {
			qna = [
				...qna,
				{
					role: 'assistant',
					content: `Perfeito! Você escolheu adicionar ${selectedNamesString} em seu produto. Agora, em qual linguagem gostaria de gerar o código? Deseja adicionar mais alguma informação?`
				}
			];
			return qna;
		});
		q3 = true;
		setupComplete = true;
		invalidq1 = false;
		invalidq2 = false;
		invalidq3 = false;
	}
	onMount(async () => {
		$input = '';
		qna.update((qna) => {
			qna = [
				{
					role: 'assistant',
					content:
						'Olá. Para lhe auxiliar no fluxo de criação de produtos da Netshoes preciso de algumas informações. Caso não saiba responder alguma delas, digite "não sei" e eu te auxiliarei com as opções disponíveis. Vamos lá?'
				},
				{
					role: 'assistant',
					content:
						'Primeiro, para em qual departamento o produto deve ser criado? Responda apenas com o nome dela por favor.'
				}
			];
			return qna;
		});
	});
	afterUpdate(() => {
		if (qna) scrollToBottom(canvas, 'instant');
	});
</script>

<svelte:head>
	<title>Teste de Modelo - AI SENSEDIA</title>
</svelte:head>
<div class="flex flex-col space-between h-screen w-screen gap-16">
	<div
		class="flex flex-col overflow-y-scroll h-[100%] w-full place-items-center"
		bind:this={canvas}
	>
		<div class="w-90 lg:w-[64rem] md:mx-auto pb-12 md:pb-0">
			<ul>
				{#each $qna as message}
					{#if message.role === 'assistant'}
						<li>
							<div class="chat chat-start max-w-xl">
								<div class="chat-image avatar">
									<div class="w-10 rounded-full">
										<img src={ZeChat} class="object-cover" alt="zé chat icon" />
									</div>
								</div>
								<div class="chat-bubble w-full max-w-full bg-[#37474F] text-white">
									{#if message.type === 'select'}
										{#if message.question === 1}
											<Select
												options={message.content}
												display_func={(o) => o.name}
												index={-1}
												section="Select a department"
												onSelect={updateInvalidQ1}
												bind:which={invalidq1}
												bind:value={$department}
											/>
										{:else if message.question === 2}
											<Select
												options={message.content}
												display_func={(o) => o.name}
												index={-1}
												section="Select a product"
												onSelect={updateInvalidQ2}
												bind:which={invalidq2}
												bind:value={$product}
											/>
										{:else}
											<div class="flex flex-col gap-5">
												<MultiSelect
													options={message.content}
													id="attributes"
													let:idx
													placeholder="Select the attributes"
													bind:selected={$attributes}
													outerDivClass="select select-primary w-full h-auto max-w-xs"
													inputClass="input input-bordered input-primary outline-[#37474F] border-[#2b373c] active:outline-[#37474F] focus:outline-[#37474F] w-full max-w-xs"
													liOptionClass="option bg-[#37474F] text-white font-light text-md"
													liActiveOptionClass="bg-blue-200 text-black font-light text-md"
													ulOptionsClass="rounded-none"
													on:open={() => {
														scrollToBottom(canvas, 'smooth');
													}}
												/>
												<button on:click={updateInvalidQ3} class="btn w-24 rounded-lg h-5 self-end"
													>Select</button
												>
											</div>
										{/if}
									{:else}
										<AiMessage message={message.content} />
									{/if}
								</div>
							</div>
						</li>{/if}
					{#if message.role === 'user'}
						<li>
							<div class="chat chat-end">
								<div class="chat-bubble bg-[#2EA8E6] text-white">{message.content}</div>
							</div>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	</div>
	<div class="w-screen flex justify-center py-3 md:py-5 bg-inherit">
		{#if formload == true || $isLoading || invalidq1 == true || invalidq2 == true || invalidq3 == true}
			<div class="absolute bottom-5">
				<span class="loading loading-dots loading-lg" />
			</div>
		{:else if setupComplete && !$isLoading && initialPrompt}
			<form on:submit={(e) => handleSubmit(e, '/initialChat')} class="absolute bottom-5">
				<div class="flex gap-4 px-2">
					<label class="hidden" hidden for="answer">Answer Input</label>
					<input
						bind:value={$input}
						autocomplete="off"
						id="answer"
						name="answer"
						class="input input-bordered input-primary outline-[#37474F] border-[#2b373c] active:outline-[#37474F] focus:outline-[#37474F] w-full max-w-xs md:max-w-xl"
					/>
					<button
						type="submit"
						class="btn-primary bg-[#37474F] hover:bg-[#2b373c] w-32 rounded-lg"
						disabled={$isLoading}>Send</button
					>
				</div>
			</form>
		{:else if setupComplete && !$isLoading && !initialPrompt}
			<form on:submit={(e) => handleSubmit(e, '/chat')} class="absolute bottom-5">
				<div class="flex gap-4 px-2">
					<label class="hidden" hidden for="answer">Answer Input</label>
					<input
						bind:value={$input}
						autocomplete="off"
						id="answer"
						name="answer"
						class="input input-bordered input-primary outline-[#37474F] border-[#2b373c] active:outline-[#37474F] focus:outline-[#37474F] w-full max-w-xs md:max-w-2xl"
					/>
					<button
						type="submit"
						class="btn-primary bg-[#37474F] hover:bg-[#2b373c] w-32 rounded-lg"
						disabled={$isLoading}>Send</button
					>
				</div>
			</form>
		{:else if $qna.length < 3}
			<form
				method="POST"
				action="?/validateq1"
				use:enhance={({ formData }) => {
					const a1 = formData.get('a1');
					if (a1 == null) return;
					const restartPattern = /reinicie o fluxo|recomece o fluxo/;
					if (a1.toString().toLocaleLowerCase().match(restartPattern)) {
						window.location.reload();
					}
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
					return ({ result, update }) => {
						if (result.type == 'success') {
							//@ts-ignore
							$department = result.data?.app;
							formload = false;

							qna.update((qna) => {
								qna = [
									...qna,
									{
										role: 'assistant',
										content: `Perfeito! O departamento escolhido foi ${$department.name}. Agora escolha o tipo de produto que deseja cadastrar`
									}
								];
								return qna;
							});
							q1 = false;
							q2 = true;
							$input = '';
						}
						if (result.type == 'failure') {
							formload = false;
							invalidq1 = true;
							updateDepartmentsList(result.data?.apps);
							qna.update((qna) => {
								qna = [
									...qna,
									{
										role: 'assistant',
										content:
											'Não consegui encontrar a aplicação que você digitou. Por favor, escolha uma das aplicações abaixo.'
									},
									{
										role: 'assistant',
										type: 'select',
										question: 1,
										content: departmentsList
									}
								];
								return qna;
							});
						}
						$input = '';

						update();
					};
				}}
				class="sticky bottom-5"
			>
				<div class="flex gap-4 px-2">
					<label class="hidden" for="a1">Answer Input</label>
					<input
						bind:value={$department}
						id="a1"
						name="a1"
						autocomplete="off"
						class="input input-bordered input-primary outline-[#37474F] border-[#2b373c] active:outline-[#37474F] focus:outline-[#37474F] w-full max-w-xs"
					/>
					<button
						type="submit"
						class="btn-primary w-32 bg-[#37474F] hover:bg-[#2b373c] rounded-lg"
						disabled={$isLoading}>Send</button
					>
				</div>
			</form>
		{:else if q2 == true && setupComplete == false && q3 == false}
			<form
				method="POST"
				action="?/validateq2"
				class="sticky bottom-5"
				use:enhance={({ formData }) => {
					const a2 = formData.get('a2');
					if (a2 == null) return;
					const restartPattern = /reinicie o fluxo|recomece o fluxo/;
					if (a2.toString().toLocaleLowerCase().match(restartPattern)) {
						window.location.reload();
					}
					qna.update((qna) => {
						qna = [
							...qna,
							{
								role: 'user',
								content: a2
							}
						];
						return qna;
					});
					formload = true;
					return ({ result, update }) => {
						if (result.type == 'success') {
							//@ts-ignore
							$product = result.data?.productTypes;
							formload = false;
							console.log($product);
							qna.update((qna) => {
								qna = [
									...qna,
									{
										role: 'assistant',
										content: `Perfeito! O tipo de produto escolhido foi ${$product.name}. Quais serão os atributos do seu produto?`
									}
								];
								return qna;
							});
							q1 = false;
							q2 = false;
							q3 = true;
							$input = '';
						}
						if (result.type == 'failure') {
							formload = false;
							invalidq2 = true;
							updateProductsList(result.data?.productTypes);
							qna.update((qna) => {
								qna = [
									...qna,
									{
										role: 'assistant',
										content:
											'Não consegui encontrar o tipo de produto que você digitou. Por favor, escolha uma das aplicações abaixo.'
									},
									{
										role: 'assistant',
										type: 'select',
										question: 2,
										content: productsList
									}
								];
								return qna;
							});
						}
						$input = '';

						update();
					};
				}}
			>
				<div class="flex gap-4 px-2">
					<input type="hidden" name="department" value={$department.code} />
					<label class="hidden" hidden for="a2">Answer Input</label>
					<input
						bind:value={$input}
						name="a2"
						autocomplete="off"
						id="a2"
						class="input input-bordered input-primary outline-[#37474F] border-[#2b373c] active:outline-[#37474F] focus:outline-[#37474F] w-full max-w-xs"
					/>
					<button
						type="submit"
						class="btn-primary bg-[#37474F] hover:bg-[#2b373c] w-32 rounded-lg"
						disabled={$isLoading}>Send</button
					>
				</div>
			</form>
		{:else if q3 == true && setupComplete == false}
			<form
				method="POST"
				action="?/validateq3"
				class="sticky bottom-5"
				use:enhance={({ formData }) => {
					const a2 = formData.get('a2');
					if (a2 == null) return;
					const restartPattern = /reinicie o fluxo|recomece o fluxo/;
					if (a2.toString().toLocaleLowerCase().match(restartPattern)) {
						window.location.reload();
					}
					qna.update((qna) => {
						qna = [
							...qna,
							{
								role: 'user',
								content: a2
							}
						];
						return qna;
					});
					formload = true;
					return ({ result, update }) => {
						if (result.type == 'success') {
							//@ts-ignore
							$attributes = result.data?.productAttributes;
							formload = false;
							const selectedNames = $attributes.map((item) => item.label);
							const selectedNamesString = selectedNames.join(', ');

							qna.update((qna) => {
								qna = [
									...qna,
									{
										role: 'assistant',
										content: `Perfeito! Você escolheu adicionar ${selectedNamesString} em seu produto. Agora, em qual linguagem gostaria de gerar o código? Deseja adicionar mais alguma informação?`
									}
								];
								return qna;
							});
							q3 = true;
							setupComplete = true;
							invalidq1 = false;
							invalidq2 = false;
							invalidq3 = false;
							$input = '';
						}
						if (result.type == 'failure') {
							formload = false;
							invalidq2 = true;
							updateAttributesList(result.data?.productAttributes);
							qna.update((qna) => {
								qna = [
									...qna,
									{
										role: 'assistant',
										content:
											'Não consegui encontrar os atributos que você digitou. Por favor, escolha alguns dos abaixo.'
									},
									{
										role: 'assistant',
										type: 'select',
										question: 3,
										content: attributesList
									}
								];
								return qna;
							});
						}
						$input = '';
						update();
					};
				}}
			>
				<div class="flex gap-4 px-2">
					<input type="hidden" name="department" value={$department.code} />
					<input type="hidden" name="product" value={$product.code} />
					<label class="hidden" for="a2">Answer Input</label>

					<input
						bind:value={$input}
						autocomplete="off"
						name="a2"
						id="a2"
						class="input input-bordered input-primary outline-[#37474F] border-[#2b373c] active:outline-[#37474F] focus:outline-[#37474F] w-full max-w-xs"
					/>
					<button
						type="submit"
						class="btn-primary w-32 bg-[#37474F] hover:bg-[#2b373c] rounded-lg"
						disabled={$isLoading}>Send</button
					>
				</div>
			</form>
		{/if}
	</div>
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
