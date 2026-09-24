<script lang="ts">
	import CodeEditor, { type CodeEditorProps } from './CodeEditor.svelte';

	let {
		code = $bindable(''),
		activeLine = 0,
		followActiveLine = false,
		errorLine = 0,
		disabled = false,
		showLineNumbers = true,
		placeholder = 'Escreva seu código Portugol aqui...',
		autoCloseBrackets = true,
		autoCloseQuotes = true,
		lineWrapping = true,
		onsave,
		height = '100%'
	}: CodeEditorProps = $props();
</script>

<CodeEditor
	bind:code
	language="portugol"
	{activeLine}
	{followActiveLine}
	{errorLine}
	{disabled}
	{showLineNumbers}
	{placeholder}
	{autoCloseBrackets}
	{autoCloseQuotes}
	{lineWrapping}
	{onsave}
	{height}
/>
