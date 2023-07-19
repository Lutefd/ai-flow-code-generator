<script lang="ts">
	import { marked } from 'marked';
	marked.use({ mangle: false, headerIds: false });
	export let message = '';
	let html = '';
	$: html = marked.parse(message);
</script>

{@html html}
