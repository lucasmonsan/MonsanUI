<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppShell from './AppShell.svelte';
	import BrandHeader from './BrandHeader.svelte';
	import CenteredPanel from './CenteredPanel.svelte';
	import Credits from './Credits.svelte';
	import Divider from './Divider.svelte';
	import PreferenceBar from './PreferenceBar.svelte';
	import Stack from './Stack.svelte';
	import Text from './Text.svelte';

	interface Props {
		brand: string;
		subtitle?: string;
		logoSrc: string;
		logoAlt?: string;
		descriptionLines: readonly [string, string];
		actions: Snippet;
		preferences: Snippet;
		legal?: Snippet;
		alert?: Snippet;
		fullHeight?: boolean;
	}

	let {
		brand,
		subtitle,
		logoSrc,
		logoAlt = '',
		descriptionLines,
		actions,
		preferences,
		legal,
		alert,
		fullHeight = true
	}: Props = $props();
</script>

<AppShell {fullHeight}>
	{#snippet bottom()}
		<Credits placement="page-bottom" variant="compact" spacing="default" />
	{/snippet}

	<CenteredPanel {fullHeight}>
		<Stack gap="md" fullWidth align="center" textAlign="center">
			<BrandHeader {brand} {subtitle} {logoSrc} {logoAlt} adaptiveLogo={true} />

			<div class="landing-description">
				<Text tag="p" size="sm" variant="secondary" align="center">
					{descriptionLines[0]}
				</Text>
				<Text tag="p" size="sm" variant="secondary" align="center">
					{descriptionLines[1]}
				</Text>
			</div>

			{#if alert}
				{@render alert()}
			{/if}

			<Stack gap="sm" fullWidth>
				{@render actions()}
			</Stack>

			<Divider />

			<PreferenceBar>
				{@render preferences()}
			</PreferenceBar>

			{#if legal}
				{@render legal()}
			{/if}
		</Stack>
	</CenteredPanel>
</AppShell>

<style>
	.landing-description {
		display: flex;
		width: 100%;
		max-width: 100%;
		flex-direction: column;
		gap: 0;
	}

	.landing-description :global(.monsan-text) {
		white-space: nowrap;
	}
</style>
