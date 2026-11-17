<script lang="ts">
	import CodeRunner, { type CodeRunnerProps } from './CodeRunner.svelte';

	let {
		code = $bindable(`algoritmo "sem nome"
var

inicio

fimalgoritmo`),
		disabled = false,
		onOutputsChange,
		onSuccess,
		onFailure,
		onsave,
		floatingActions,
		userId,
		fileName,
		height = '100%',
		fill = false,
		defaultFocusMode = true,
		previewCode
	}: CodeRunnerProps = $props();
</script>

<CodeRunner
	bind:code
	language="portugol"
	{disabled}
	{onOutputsChange}
	{onSuccess}
	{onFailure}
	{onsave}
	{floatingActions}
	{userId}
	{fileName}
	{height}
	{fill}
	{defaultFocusMode}
	{previewCode}
/>
