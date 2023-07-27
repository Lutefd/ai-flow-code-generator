<script lang="ts">
	import { Marked } from 'marked';
	import hljs from 'highlight.js';
	import { markedHighlight } from 'marked-highlight';
	let id = 0;

	const marked = new Marked(
		markedHighlight({
			langPrefix: '!p-0 my-4 !flex relative hljs language-',
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'shell';
				const highlightedCode = hljs.highlight(code, { language }).value;
				const result = `
        <div class="code-block w-full flex flex-col">
            <div class="title-bar flex justify-between items-center bg-gray-900 absolute top-0 w-full px-2 py-1">
                <span class="language-label">${language}</span>
                <button class="btn-primary bg-gray-200 text-gray-900 h-6 px-2 rounded-md" data-clipboard-target="#code-block-${id}">Copy</button>
            </div>
            <div class="code-container overflow-x-auto px-4 flex pt-12 ">
                <pre id="code-block-${id}" class="hljs language-${lang} code-overflow"><code>${highlightedCode}</code></pre>
            </div>
        </div>`;
				id += 1;
				return result;
			}
		})
	);
	marked.use({ mangle: false, headerIds: false });

	export let message = '';
	let html = '';
	$: {
		html = marked.parse(message);
		// Use event delegation to handle copy button clicks
		document.body.addEventListener('click', (event) => {
			const target = event.target as HTMLElement; // cast event.target to HTMLElement
			if (target.matches('.btn-primary')) {
				const copyTargetId = target.getAttribute('data-clipboard-target');
				if (copyTargetId) {
					const codeBlock = document.querySelector(copyTargetId) as HTMLElement;
					if (codeBlock) {
						const copyText = codeBlock.innerText;
						navigator.clipboard.writeText(copyText);
					}
				}
			}
		});
	}
</script>

{@html html}

<style lang="scss" global>
	@import 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css';
	textarea,
	.preview {
		box-sizing: border-box;
		display: block;
		width: 100%;
	}
	pre code.hljs {
		padding: 0 !important;
	}
	code {
		padding: 0 !important;
	}
	textarea {
		font-family: monospace, Roboto;
		height: 25%;
		border: none;
		margin: 0;
		padding-inline: 1rem;
	}

	.preview {
		height: 75%;
		padding-inline: 2rem;
		border-top: solid 2px #888;
	}
	pre {
		padding: 0;
		margin: 0;
		box-sizing: border-box;
	}
	code {
		padding: 0;
	}
	pre code {
		font-size: 0.75rem;
	}
	h1 {
		background: #e1e1e1;
		margin: 0px;
		padding: 0.8rem;
		font-size: 1.2rem;
	}

	:global(body) {
		padding: 0;
	}
	:global(blockquote) {
		border-left-color: #ccd1d8;
		border-right-color: #aab2bc;
	}
	.title-bar {
		font-family: monospace;
		font-size: 0.9em;
	}

	.language-label {
		color: #333;
	}
	:global(::-webkit-scrollbar) {
		width: 0.4rem !important;
		height: 0.4rem !important;
	}
	:global(::-webkit-scrollbar-thumb) {
		background-color: #fff !important;
		border-radius: 1rem !important;
	}
</style>
