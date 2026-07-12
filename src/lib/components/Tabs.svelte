<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component, Snippet } from 'svelte';
	import ChevronLeft from './icons/ChevronLeft.svelte';
	import { i18n } from '../utils/i18n.svelte';

	type IconComponent = Component<{ size?: number }>;

	interface TabItem {
		id: string;
		label: string;
		icon?: IconComponent;
	}

	let {
		value = $bindable(),
		items = [],
		wrap = false,
		variant = 'default',
		scrollable = false,
		showNavButtons = false,
		hideLabels = false,
		embedded = false,
		scrollLeftLabel,
		scrollRightLabel,
		panelIdPrefix,
		onchange,
		item: itemSnippet
	} = $props<{
		value: string;
		items: TabItem[];
		wrap?: boolean;
		variant?: 'default' | 'underline';
		scrollable?: boolean;
		showNavButtons?: boolean;
		hideLabels?: boolean;
		embedded?: boolean;
		scrollLeftLabel?: string;
		scrollRightLabel?: string;
		panelIdPrefix?: string;
		onchange?: (value: string) => void;
		item?: Snippet<[TabItem, number]>;
	}>();

	let activeScrollLeftLabel = $derived(scrollLeftLabel ?? i18n.t('tabs.scrollLeft'));
	let activeScrollRightLabel = $derived(scrollRightLabel ?? i18n.t('tabs.scrollRight'));

	let containerEl = $state<HTMLElement | null>(null);
	let showLeftGradient = $state(false);
	let showRightGradient = $state(false);
	const tabsId = $props.id();

	function getTabId(id: string) {
		return `${tabsId}-tab-${id}`;
	}

	function getPanelId(id: string) {
		return panelIdPrefix ? `${panelIdPrefix}-${id}` : undefined;
	}

	function updateScrollShadows() {
		if (containerEl && scrollable) {
			const { scrollLeft, scrollWidth, clientWidth } = containerEl;
			showLeftGradient = scrollLeft > 0.5;
			showRightGradient = scrollLeft + clientWidth < scrollWidth - 0.5;
		} else {
			showLeftGradient = false;
			showRightGradient = false;
		}
	}

	function scrollLeft() {
		if (containerEl) {
			containerEl.scrollBy({ left: -150, behavior: 'smooth' });
		}
	}

	function scrollRight() {
		if (containerEl) {
			containerEl.scrollBy({ left: 150, behavior: 'smooth' });
		}
	}

	function selectTab(id: string) {
		value = id;
		onchange?.(id);
	}

	function getTabButtons() {
		if (!containerEl) return [];
		return Array.from(containerEl.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
	}

	function focusTabAt(index: number) {
		const buttons = getTabButtons();
		const target = buttons[index];
		const targetId = target?.dataset.tabId;
		if (!target || !targetId) return;

		target.focus();
		selectTab(targetId);
	}

	function handleTabListKeydown(event: KeyboardEvent) {
		if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
			return;
		}

		const buttons = getTabButtons();
		if (buttons.length === 0) return;

		const activeElement = document.activeElement;
		const currentButton = activeElement instanceof HTMLButtonElement ? activeElement : null;
		const currentIndex = currentButton ? buttons.indexOf(currentButton) : -1;
		const fallbackIndex = Math.max(
			0,
			buttons.findIndex((button) => button.dataset.tabId === value)
		);
		const baseIndex = currentIndex >= 0 ? currentIndex : fallbackIndex;
		let nextIndex = baseIndex;

		if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = buttons.length - 1;
		} else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			nextIndex = (baseIndex + 1) % buttons.length;
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			nextIndex = (baseIndex - 1 + buttons.length) % buttons.length;
		}

		event.preventDefault();
		focusTabAt(nextIndex);
	}

	onMount(() => {
		if (!containerEl) return;

		updateScrollShadows();
		containerEl.addEventListener('scroll', updateScrollShadows, { passive: true });

		const resizeObserver = new ResizeObserver(() => {
			updateScrollShadows();
		});
		resizeObserver.observe(containerEl);

		const mutationObserver = new MutationObserver(() => {
			updateScrollShadows();
			if (containerEl) {
				Array.from(containerEl.children).forEach((child) => {
					resizeObserver.observe(child);
				});
			}
		});
		mutationObserver.observe(containerEl, { childList: true, subtree: true });

		Array.from(containerEl.children).forEach((child) => {
			resizeObserver.observe(child);
		});

		window.addEventListener('resize', updateScrollShadows, { passive: true });

		const timer1 = setTimeout(updateScrollShadows, 100);
		const timer2 = setTimeout(updateScrollShadows, 500);

		return () => {
			containerEl?.removeEventListener('scroll', updateScrollShadows);
			window.removeEventListener('resize', updateScrollShadows);
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			clearTimeout(timer1);
			clearTimeout(timer2);
		};
	});

	$effect(() => {
		if (value || scrollable) {
			setTimeout(updateScrollShadows, 0);
		}
	});
</script>

<div class="monsan-tabs-wrapper" class:is-scrollable={scrollable}>
	{#if scrollable && showLeftGradient}
		<div class="monsan-tabs-nav-wrapper nav-left-wrapper">
			{#if showNavButtons}
				<button
					type="button"
					class="monsan-tabs-nav-btn"
					onclick={scrollLeft}
					aria-label={activeScrollLeftLabel}
				>
					<ChevronLeft size={16} />
				</button>
			{/if}
		</div>
	{/if}

	<div
		bind:this={containerEl}
		class="monsan-tabs-container variant-{variant}"
		class:wrap-tabs={wrap}
		class:scrollable
		class:has-nav-buttons={scrollable && showNavButtons}
		class:hide-labels={hideLabels}
		class:embedded
		role="tablist"
		tabindex="-1"
		style:--mask-left={showLeftGradient ? '48px' : '0px'}
		style:--mask-right={showRightGradient ? '48px' : '0px'}
		onkeydown={handleTabListKeydown}
	>
		{#each items as tab, index (tab.id)}
			{#if itemSnippet}
				{@render itemSnippet(tab, index)}
			{:else}
				<button
					type="button"
					class="monsan-tab-item"
					class:active={value === tab.id}
					class:has-icon={!!tab.icon}
					onclick={() => selectTab(tab.id)}
					role="tab"
					id={getTabId(tab.id)}
					data-tab-id={tab.id}
					aria-selected={value === tab.id}
					aria-controls={getPanelId(tab.id)}
					tabindex={value === tab.id ? 0 : -1}
				>
					{#if tab.icon}
						<span class="monsan-tab-icon">
							<tab.icon size={16} />
						</span>
					{/if}
					<span class="monsan-tab-text">{tab.label}</span>
				</button>
			{/if}
		{/each}
	</div>

	{#if scrollable && showRightGradient}
		<div class="monsan-tabs-nav-wrapper nav-right-wrapper">
			{#if showNavButtons}
				<button
					type="button"
					class="monsan-tabs-nav-btn is-right"
					onclick={scrollRight}
					aria-label={activeScrollRightLabel}
				>
					<ChevronLeft size={16} />
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.monsan-tabs-wrapper {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		overflow: visible;
	}

	.monsan-tabs-wrapper.is-scrollable {
		overflow: visible;
	}

	.monsan-tabs-container {
		display: flex;
		gap: var(--space-sm);
		border-bottom: 0;
		padding: 2px 4px 4px 2px;
		margin: -2px -4px -4px -2px;
		width: 100%;
		flex-wrap: wrap;
		overflow: visible;
		scrollbar-width: auto;
		box-sizing: border-box;
	}

	.monsan-tabs-container.scrollable {
		flex-wrap: nowrap;
		overflow-x: auto;
		overflow-y: visible;
		scroll-behavior: smooth;
		scrollbar-width: none;
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0%,
			#000 var(--mask-left, 0px),
			#000 calc(100% - var(--mask-right, 0px)),
			transparent 100%
		);
		mask-image: linear-gradient(
			to right,
			transparent 0%,
			#000 var(--mask-left, 0px),
			#000 calc(100% - var(--mask-right, 0px)),
			transparent 100%
		);
	}

	.monsan-tabs-container.scrollable::-webkit-scrollbar {
		display: none;
	}

	.monsan-tabs-container.wrap-tabs {
		flex-wrap: wrap;
		overflow: visible;
		scrollbar-width: auto;
		width: 100%;
	}

	.monsan-tabs-container.wrap-tabs .monsan-tab-item {
		flex-grow: 1;
		flex-shrink: 0;
	}

	.monsan-tabs-container.has-nav-buttons {
		padding-left: 44px;
		padding-right: 44px;
	}

	/* TabItem styles */
	.monsan-tab-item {
		font-family: inherit;
		font-weight: 800;
		text-transform: uppercase;
		font-size: var(--text-sm);
		padding: var(--space-sm) var(--space-md);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background-color: var(--bg-primary);
		color: var(--text-primary);
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.15s var(--ease-out);
		box-shadow: var(--shadow-sm);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		gap: var(--space-xs);
		box-sizing: border-box;
	}

	.monsan-tab-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.monsan-tab-item:hover:not(.active) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--text-primary);
	}

	.monsan-tab-item:active:not(.active) {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.monsan-tab-item:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.monsan-tab-item.active {
		background-color: var(--accent-primary);
		color: var(--bg-primary);
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	:global([data-theme='dark']) .monsan-tab-item.active {
		color: var(--text-primary);
		background-color: var(--accent-primary);
	}

	/* Underline Variant */
	.monsan-tabs-container.variant-underline .monsan-tab-item {
		border: none;
		border-bottom: var(--border-width) solid transparent;
		border-radius: 0;
		background-color: transparent;
		box-shadow: none;
		padding-left: var(--space-sm);
		padding-right: var(--space-sm);
		padding-bottom: calc(var(--space-sm) + 2px);
		margin-bottom: -2px;
	}
	.monsan-tabs-container.variant-underline .monsan-tab-item:hover:not(.active) {
		transform: none;
		box-shadow: none;
		border-bottom-color: var(--text-secondary);
	}
	.monsan-tabs-container.variant-underline .monsan-tab-item:active:not(.active) {
		transform: none;
	}
	.monsan-tabs-container.variant-underline .monsan-tab-item.active {
		background-color: transparent;
		color: var(--accent-primary);
		transform: none;
		box-shadow: none;
		border-bottom: 4px solid var(--accent-primary);
		margin-bottom: -2px;
		padding-bottom: calc(var(--space-sm) - 0px);
	}
	:global([data-theme='dark']) .monsan-tabs-container.variant-underline .monsan-tab-item.active {
		color: var(--accent-primary);
		background-color: transparent;
		border-bottom-color: var(--accent-primary);
	}

	/* Nav controls gradients */
	.monsan-tabs-nav-wrapper {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 36px;
		display: flex;
		align-items: center;
		pointer-events: none;
		z-index: 10;
	}

	.monsan-tabs-nav-wrapper * {
		pointer-events: auto;
	}

	.nav-left-wrapper {
		left: 0;
		background: transparent;
		justify-content: flex-start;
		padding-left: 4px;
	}

	.nav-right-wrapper {
		right: 0;
		background: transparent;
		justify-content: flex-end;
		padding-right: 4px;
	}

	.monsan-tabs-nav-btn {
		background: var(--accent-primary);
		color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: var(--shadow-sm);
		border-radius: var(--radius-sm);
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.1s var(--ease-out);
	}

	.monsan-tabs-nav-btn:hover {
		background-color: var(--accent-hover);
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0px var(--text-primary);
	}

	.monsan-tabs-nav-btn:active {
		transform: translate(1px, 1px);
		box-shadow: none;
	}

	.monsan-tabs-nav-btn.is-right :global(svg) {
		transform: rotate(180deg);
	}

	:global([data-theme='dark']) .monsan-tabs-nav-btn {
		color: var(--text-primary);
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-tabs-container.scrollable {
			scroll-behavior: auto;
		}

		.monsan-tab-item,
		.monsan-tabs-nav-btn {
			transition: none;
		}
	}

	@media (max-width: 600px) {
		.monsan-tabs-container.hide-labels .monsan-tab-text {
			display: none;
		}

		.monsan-tabs-container.hide-labels {
			flex-wrap: nowrap;
		}

		.monsan-tabs-container.hide-labels .monsan-tab-item {
			flex: 1 1 0;
			min-width: 0;
			padding-right: var(--space-sm);
			padding-left: var(--space-sm);
		}
	}

	.monsan-tabs-container.variant-underline {
		padding-bottom: 0;
	}

	.monsan-tabs-container.embedded {
		width: 100%;
		margin: 0;
		padding: 2px 0;
		border-bottom: 0;
	}
</style>
