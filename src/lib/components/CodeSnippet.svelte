<script lang="ts">
	import PortugolCode from './PortugolCode.svelte';

	interface Props {
		code: string;
		language?: 'portugol' | 'javascript';
		size?: 'xs' | 'sm' | 'md' | 'lg';
		weight?: 'normal' | 'medium' | 'bold';
	}

	let { code, language = 'portugol', size = 'sm', weight = 'normal' }: Props = $props();
</script>

<PortugolCode {code} {language} {size} {weight} />
