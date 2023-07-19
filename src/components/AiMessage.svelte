<script lang="ts">
	import { Marked } from 'marked';
	import hljs from 'highlight.js';
	import { markedHighlight } from 'marked-highlight';

	// 	marked.use({ mangle: false, headerIds: false }, markedHighlight{
	//         async: true,
	//         highlight: (code, lang) => {
	//             return hljs.highlight(code, { language: lang }).value;
	//         }
	// })

	const marked = new Marked(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				console.log(language);
				console.log(hljs.highlight(code, { language }).value);
				return hljs.highlight(code, { language }).value;
			}
		})
	);
	marked.use({ mangle: false, headerIds: false });

	export let message = '';
	let html = '';
	$: html = marked.parse(message);
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

	textarea {
		font-family: monospace, Roboto;
		height: 25%;
		border: none;
		margin: 0;
		padding: 1rem;
	}

	.preview {
		height: 75%;
		padding: 2rem;
		border-top: solid 2px #888;
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
</style>
