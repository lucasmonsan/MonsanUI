<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Input from './Input.svelte';
	import Button from './Button.svelte';
	import Plus from './icons/Plus.svelte';
	import Pencil from './icons/Pencil.svelte';
	import QuickActions from './QuickActions.svelte';
	import Trash from './icons/Trash.svelte';
	import DotsThreeVertical from './icons/DotsThreeVertical.svelte';
	import IconButton from './IconButton.svelte';
	import ColorPicker from './ColorPicker.svelte';
	import Inline from './Inline.svelte';
	import { i18n } from '../utils/i18n.svelte';
	import type { Snippet } from 'svelte';

	interface Folder {
		id: string;
		name: string;
		color?: string;
	}

	interface Props {
		items: Folder[];
		activeId: string | null;
		onSelect?: (id: string | null) => void;
		layout?: 'horizontal' | 'grid' | 'wrap' | 'content';
		editingFolderId?: string | null;
		mode?: 'select' | 'edit' | 'delete';
		onAction?: (mode: 'edit' | 'delete', folderId: string) => void;
		onCreateFolder?: (name: string, color: string) => void | Folder;
		onUpdateFolder?: (id: string, name: string, color: string) => void;
		onWarning?: (message: string) => void;
		showAll?: boolean;
		showCreateModal?: boolean;
		hideAddButton?: boolean;
		labels?: {
			allFolders: string;
			newFolder: string;
			editFolder: string;
			folderNameLabel: string;
			folderNamePlaceholder: string;
			folderColorLabel: string;
			cancel: string;
			save: string;
			create: string;
			cannotDeleteAllFolder: string;
			edit?: string;
			delete?: string;
			options?: string;
			colorLabel?: (color: string) => string;
		};
		itemsContent?: Snippet<[Folder[]]>;
		maxNameLength?: number;
	}

	let {
		items,
		activeId = $bindable(),
		onSelect,
		layout = 'horizontal',
		editingFolderId = $bindable(null),
		mode = 'select',
		onAction,
		onCreateFolder,
		onUpdateFolder,
		onWarning,
		showAll = true,
		showCreateModal = $bindable(false),
		hideAddButton = false,
		labels,
		itemsContent,
		maxNameLength
	}: Props = $props();

	let foldersBarElement = $state<HTMLElement>();
	let hasFolderScrollLeft = $state(false);
	let hasFolderScrollRight = $state(false);
	let showModal = $state(false);
	let newFolderName = $state('');
	let newFolderColor = $state('default');
	let folderNameInput = $state<{ focus: () => void }>();
	let wasModalOpen = false;

	const l = $derived({
		allFolders: labels?.allFolders ?? i18n.t('folders.allFolders'),
		newFolder: labels?.newFolder ?? i18n.t('folders.newFolder'),
		editFolder: labels?.editFolder ?? i18n.t('folders.editFolder'),
		folderNameLabel: labels?.folderNameLabel ?? i18n.t('folders.folderNameLabel'),
		folderNamePlaceholder: labels?.folderNamePlaceholder ?? i18n.t('folders.folderNamePlaceholder'),
		folderColorLabel: labels?.folderColorLabel ?? i18n.t('folders.folderColorLabel'),
		cancel: labels?.cancel ?? i18n.t('folders.cancel'),
		save: labels?.save ?? i18n.t('folders.save'),
		create: labels?.create ?? i18n.t('folders.create'),
		cannotDeleteAllFolder: labels?.cannotDeleteAllFolder ?? i18n.t('folders.cannotDeleteAllFolder'),
		edit: labels?.edit ?? i18n.t('folders.edit'),
		delete: labels?.delete ?? i18n.t('folders.delete'),
		options: labels?.options ?? i18n.t('folders.options')
	});

	let sortedFolders = $derived.by(() => {
		if (!activeId) return items;
		const active = items.find((f) => f.id === activeId);
		const others = items.filter((f) => f.id !== activeId);
		return active ? [active, ...others] : items;
	});

	function handleFolderScroll(e: Event) {
		const target = e.target as HTMLElement;
		hasFolderScrollLeft = target.scrollLeft > 5;
		hasFolderScrollRight = target.scrollLeft + target.clientWidth < target.scrollWidth - 5;
	}

	function handleWheel(e: WheelEvent) {
		const target = e.currentTarget as HTMLElement;
		if (e.deltaY !== 0) {
			target.scrollLeft += e.deltaY;
			e.preventDefault();
		}
	}

	function checkScroll() {
		if (foldersBarElement) {
			hasFolderScrollLeft = foldersBarElement.scrollLeft > 5;
			hasFolderScrollRight =
				foldersBarElement.scrollLeft + foldersBarElement.clientWidth <
				foldersBarElement.scrollWidth - 5;
		}
	}

	function triggerEdit(folderId: string, event: MouseEvent) {
		event.stopPropagation();
		editingFolderId = folderId;
	}

	function triggerDelete(folderId: string, event: MouseEvent) {
		event.stopPropagation();
		onAction?.('delete', folderId);
	}

	function handleCloseModal() {
		showModal = false;
		showCreateModal = false;
		editingFolderId = null;
	}

	function customColor(color: string | undefined): string | undefined {
		return color && /^#[0-9a-f]{6}$/i.test(color) ? color : undefined;
	}

	function colorPickerValue(color: string): string {
		const legacyColors: Record<string, string> = {
			blue: '#3d5a80',
			green: '#2d6a4f',
			yellow: '#e9c46a',
			purple: '#9d4edd',
			orange: '#f4a261',
			red: '#e63946'
		};
		return customColor(color) ?? legacyColors[color] ?? '#c44933';
	}

	function contrastForeground(color: string | undefined): string | undefined {
		if (!color) return undefined;
		const channels = [1, 3, 5].map(
			(index) => Number.parseInt(color.slice(index, index + 2), 16) / 255
		);
		const luminance = channels
			.map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
			.reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
		return luminance > 0.179 ? '#171717' : '#ffffff';
	}

	$effect(() => {
		const dependencyKey = `${items.length}:${activeId ?? ''}`;
		if (dependencyKey) {
			queueMicrotask(checkScroll);
		}
	});

	$effect(() => {
		if (editingFolderId) {
			const folder = items.find((f) => f.id === editingFolderId);
			if (folder) {
				newFolderName = folder.name;
				newFolderColor = folder.color || 'default';
				showModal = true;
			}
		}
	});

	$effect(() => {
		if (showCreateModal) {
			newFolderName = '';
			newFolderColor = 'default';
			showModal = true;
		}
	});

	$effect(() => {
		if (showModal && !wasModalOpen) {
			queueMicrotask(() => folderNameInput?.focus());
		}
		wasModalOpen = showModal;
	});
</script>

<div
	class="folders-bar"
	bind:this={foldersBarElement}
	onscroll={handleFolderScroll}
	onwheel={handleWheel}
	class:fade-left={hasFolderScrollLeft && layout === 'horizontal'}
	class:fade-right={hasFolderScrollRight && layout === 'horizontal'}
	class:layout-horizontal={layout === 'horizontal'}
	class:layout-wrap={layout === 'wrap'}
	class:layout-grid={layout === 'grid'}
	class:layout-content={layout === 'content'}
>
	{#if itemsContent}
		{@render itemsContent(sortedFolders)}
	{:else if showAll}
		<button
			type="button"
			class="folder-chip-all"
			class:active={activeId === null}
			onclick={() => {
				if (mode === 'select') {
					activeId = null;
					onSelect?.(null);
				} else {
					onWarning?.(l.cannotDeleteAllFolder);
				}
			}}
		>
			{l.allFolders}
		</button>
	{/if}
	{#if !itemsContent}
		{#each sortedFolders as folder (folder.id)}
			<div
				class="folder-chip"
				class:active={activeId === folder.id}
				class:has-custom-color={Boolean(customColor(folder.color))}
				class:mode-edit={mode === 'edit'}
				class:mode-delete={mode === 'delete'}
				data-deck-theme={customColor(folder.color) ? undefined : folder.color || 'default'}
				style:--folder-custom-color={customColor(folder.color)}
				style:--folder-custom-foreground={contrastForeground(customColor(folder.color))}
			>
				<button
					type="button"
					class="folder-chip-text"
					title={folder.name}
					onclick={() => {
						if (mode === 'select') {
							activeId = folder.id;
							onSelect?.(folder.id);
						} else if (mode === 'edit' || mode === 'delete') {
							onAction?.(mode, folder.id);
						}
					}}
				>
					{folder.name}
				</button>

				<div class="folder-chip-actions">
					<QuickActions
						variant="reveal"
						align="right"
						width="max-content"
						placement="before"
						panelLayout="horizontal"
						surface="plain"
						containedReveal
						triggerLabel={l.options}
					>
						{#snippet trigger()}
							<IconButton size="sm" variant="ghost" label={l.options}>
								<DotsThreeVertical size={16} />
							</IconButton>
						{/snippet}
						<IconButton size="sm" label={l.edit} onclick={(e) => triggerEdit(folder.id, e)}>
							<Pencil size={16} />
						</IconButton>
						<IconButton
							size="sm"
							variant="error"
							label={l.delete}
							onclick={(e) => triggerDelete(folder.id, e)}
						>
							<Trash size={16} />
						</IconButton>
					</QuickActions>
				</div>
			</div>
		{/each}
		{#if !hideAddButton}
			<button
				type="button"
				class="folder-chip-all add-folder-chip"
				onclick={() => {
					showCreateModal = true;
				}}
				title={l.newFolder}
				aria-label={l.newFolder}
			>
				<Plus size={16} />
			</button>
		{/if}
	{/if}
</div>

<Dialog
	bind:open={showModal}
	title={editingFolderId ? l.editFolder : l.newFolder}
	onClose={handleCloseModal}
	animation="pop"
>
	<div class="folder-form">
		<div class="form-group">
			<label for="folder-name">{l.folderNameLabel}</label>
			<Inline gap="sm" align="center" fullWidth growFirstChild>
				<Input
					bind:this={folderNameInput}
					id="folder-name"
					type="text"
					bind:value={newFolderName}
					placeholder={l.folderNamePlaceholder}
					maxlength={maxNameLength}
				/>
				<ColorPicker
					value={colorPickerValue(newFolderColor)}
					variant="swatch"
					ariaLabel={l.folderColorLabel}
					onchange={(color) => (newFolderColor = color)}
				/>
			</Inline>
		</div>
		<div class="form-actions">
			<Button variant="secondary" onclick={handleCloseModal}>{l.cancel}</Button>
			<Button
				variant="primary"
				onclick={() => {
					if (newFolderName.trim()) {
						if (editingFolderId) {
							onUpdateFolder?.(editingFolderId, newFolderName.trim(), newFolderColor);
						} else {
							const newFolder = onCreateFolder?.(newFolderName.trim(), newFolderColor);
							if (newFolder) {
								activeId = newFolder.id;
								onSelect?.(newFolder.id);
							}
						}
						handleCloseModal();
					}
				}}
			>
				{editingFolderId ? l.save : l.create}
			</Button>
		</div>
	</div>
</Dialog>

<style>
	.folders-bar {
		display: flex;
		gap: var(--space-sm);
		width: 100%;
		max-width: 100%;
		min-width: 0;
		box-sizing: border-box;
		background: transparent;
	}

	.folders-bar.layout-horizontal {
		overflow-x: auto;
		padding: var(--space-sm);
		padding-bottom: 120px;
		-webkit-overflow-scrolling: touch;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.folders-bar.layout-horizontal::-webkit-scrollbar {
		display: none;
	}

	.folders-bar.layout-wrap {
		flex-wrap: wrap;
		overflow: visible;
		padding: var(--space-sm);
	}

	.folders-bar.layout-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--space-sm);
		overflow-x: visible;
		padding: var(--space-sm);
		padding-bottom: var(--space-sm);
		margin-bottom: 0;
	}

	.folders-bar.layout-content {
		display: block;
		overflow: visible;
		padding: 0;
	}

	.folders-bar.layout-grid .folder-chip,
	.folders-bar.layout-grid .folder-chip-all {
		width: 100%;
		height: auto;
		min-height: 50px;
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		text-align: center;
		font-size: var(--text-sm);
		border-radius: var(--radius-md);
		padding: 0;
		white-space: normal;
		word-break: break-word;
	}

	.folders-bar.layout-grid .folder-chip-all {
		justify-content: center;
		padding: var(--space-sm);
	}

	.folders-bar.layout-grid .folder-chip-text {
		flex-grow: 1;
		padding: var(--space-sm);
	}

	.folders-bar.fade-left {
		mask-image: linear-gradient(to right, transparent, black 10%, black 100%);
		-webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 100%);
	}

	.folders-bar.fade-right {
		mask-image: linear-gradient(to right, black 90%, transparent);
		-webkit-mask-image: linear-gradient(to right, black 90%, transparent);
	}

	.folders-bar.fade-left.fade-right {
		mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
		-webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
	}

	.folder-chip-all {
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-xs) var(--space-sm);
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-sm);
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.1s var(--ease-out),
			filter 0.1s var(--ease-out),
			background-color 0.2s var(--ease-out);
		color: var(--text-primary);
	}

	.folder-chip-all:hover {
		filter: brightness(1.06);
	}

	.folder-chip-all.active {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.folder-chip {
		display: inline-flex;
		align-items: center;
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		padding: 0;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-sm);
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.1s var(--ease-out),
			filter 0.1s var(--ease-out),
			background-color 0.2s var(--ease-out);
		color: var(--text-primary);
		position: relative;
	}

	.folder-chip:hover {
		filter: brightness(1.06);
	}

	.folder-chip-text {
		background: transparent;
		border: none;
		padding: var(--space-xs) var(--space-sm);
		font-family: inherit;
		font-weight: inherit;
		font-size: inherit;
		color: inherit;
		cursor: pointer;
		text-align: left;
		display: flex;
		align-items: center;
		height: 100%;
		border-radius: var(--radius-md) 0 0 var(--radius-md);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex-grow: 1;
	}

	@media (max-width: 768px) {
		.folder-chip-text {
			max-width: 150px;
		}
	}

	@media (max-width: 480px) {
		.folder-chip-text {
			max-width: 110px;
		}
	}

	.folder-chip.active {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.folder-chip.has-custom-color {
		background: color-mix(in srgb, var(--folder-custom-color) 10%, var(--bg-secondary));
	}

	.folder-chip.active.has-custom-color {
		background: var(--folder-custom-color);
		color: var(--folder-custom-foreground);
	}

	.folder-chip-actions {
		position: relative;
		display: flex;
		align-items: center;
		align-self: stretch;
	}

	.folder-chip.mode-edit {
		border-color: var(--info);
		border-style: dashed;
	}

	.folder-chip.mode-delete {
		border-color: var(--error);
		border-style: dashed;
	}

	.add-folder-chip {
		border-style: dashed;
		background: transparent;
		box-shadow: none;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-xs);
		min-width: 36px;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			filter 0.1s var(--ease-out),
			border-style 0.2s var(--ease-out);
	}

	.add-folder-chip:hover {
		border-style: solid;
		background: var(--bg-secondary);
		filter: brightness(1.06);
	}

	.add-folder-chip:active {
		transform: scale(0.96);
	}

	.folder-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.form-group label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}

	@media (prefers-reduced-motion: reduce) {
		.folder-chip-all,
		.folder-chip,
		.add-folder-chip {
			transition: none;
		}
	}
</style>
