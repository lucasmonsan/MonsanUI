<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Input from './Input.svelte';
	import Button from './Button.svelte';
	import Plus from './icons/Plus.svelte';
	import QuickActions from './QuickActions.svelte';

	interface Folder {
		id: string;
		name: string;
		color?: string;
	}

	interface Props {
		items: Folder[];
		activeId: string | null;
		onSelect?: (id: string | null) => void;
		layout?: 'horizontal' | 'grid' | 'wrap';
		editingFolderId?: string | null;
		mode?: 'select' | 'edit' | 'delete';
		onAction?: (mode: 'edit' | 'delete', folderId: string) => void;
		onCreateFolder?: (name: string, color: string) => void | Folder;
		onUpdateFolder?: (id: string, name: string, color: string) => void;
		onWarning?: (message: string) => void;
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
		};
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
		showCreateModal = $bindable(false),
		hideAddButton = false,
		labels
	}: Props = $props();

	let foldersBarElement = $state<HTMLElement>();
	let hasFolderScrollLeft = $state(false);
	let hasFolderScrollRight = $state(false);
	let showModal = $state(false);
	let newFolderName = $state('');
	let newFolderColor = $state('default');

	const l = $derived({
		allFolders: labels?.allFolders ?? 'Todas',
		newFolder: labels?.newFolder ?? 'Nova Pasta',
		editFolder: labels?.editFolder ?? 'Editar Pasta',
		folderNameLabel: labels?.folderNameLabel ?? 'Nome da Pasta',
		folderNamePlaceholder: labels?.folderNamePlaceholder ?? 'Digite o nome...',
		folderColorLabel: labels?.folderColorLabel ?? 'Cor',
		cancel: labels?.cancel ?? 'Cancelar',
		save: labels?.save ?? 'Salvar',
		create: labels?.create ?? 'Criar',
		cannotDeleteAllFolder: labels?.cannotDeleteAllFolder ?? 'Não é possível excluir a pasta padrão',
		edit: labels?.edit ?? 'Editar',
		delete: labels?.delete ?? 'Excluir',
		options: labels?.options ?? 'Opções'
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
>
	<button
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
	{#each sortedFolders as folder (folder.id)}
		<div
			class="folder-chip"
			class:active={activeId === folder.id}
			class:mode-edit={mode === 'edit'}
			class:mode-delete={mode === 'delete'}
			data-deck-theme={folder.color || 'default'}
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
				<QuickActions variant="dropdown" align="right">
					{#snippet trigger()}
						<button type="button" class="folder-options-btn" aria-label={l.options}>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="1.5" />
								<circle cx="12" cy="5" r="1.5" />
								<circle cx="12" cy="19" r="1.5" />
							</svg>
						</button>
					{/snippet}
					<button type="button" class="dropdown-item" onclick={(e) => triggerEdit(folder.id, e)}>
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							style="margin-right: 6px;"
						>
							<path d="M12 20h9" />
							<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
						</svg>
						{l.edit}
					</button>
					<button
						type="button"
						class="dropdown-item delete-item"
						onclick={(e) => triggerDelete(folder.id, e)}
					>
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							style="margin-right: 6px;"
						>
							<path d="M3 6h18" />
							<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
							<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
						</svg>
						{l.delete}
					</button>
				</QuickActions>
			</div>
		</div>
	{/each}
	{#if !hideAddButton}
		<button
			class="folder-chip-all add-folder-chip"
			onclick={() => {
				showCreateModal = true;
			}}
			title={l.newFolder}
		>
			<Plus size={16} />
		</button>
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
			<Input
				id="folder-name"
				type="text"
				bind:value={newFolderName}
				placeholder={l.folderNamePlaceholder}
				autofocus
			/>
		</div>
		<div class="form-group">
			<span class="label-span">{l.folderColorLabel}</span>
			<div class="color-options">
				{#each ['default', 'blue', 'green', 'yellow', 'purple', 'orange', 'red'] as color (color)}
					<button
						class="color-btn {color}"
						class:selected={newFolderColor === color}
						onclick={() => (newFolderColor = color)}
						title={color}
					></button>
				{/each}
			</div>
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
			box-shadow 0.1s var(--ease-out),
			background-color 0.2s var(--ease-out);
		color: var(--text-primary);
	}

	.folder-chip-all:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--text-primary);
	}

	.folder-chip-all.active {
		background: var(--accent-primary);
		color: var(--bg-primary);
		box-shadow: none;
		transform: translate(2px, 2px);
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
			box-shadow 0.1s var(--ease-out),
			background-color 0.2s var(--ease-out);
		color: var(--text-primary);
		position: relative;
	}

	.folder-chip:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--text-primary);
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

		/* Ellipsis Truncation Setup */
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
		box-shadow: none;
		transform: translate(2px, 2px);
	}

	.folder-chip.active .folder-options-btn {
		color: var(--bg-primary);
		border-left-color: var(--bg-primary);
	}

	:global([data-theme='dark']) .folder-chip.active .folder-options-btn {
		color: var(--text-primary);
		border-left-color: var(--text-primary);
	}

	.folder-chip-actions {
		position: relative;
		display: flex;
		align-items: center;
		align-self: stretch;
	}

	.folder-options-btn {
		background: transparent;
		border: none;
		border-left: 1px solid var(--border-color);
		height: 100%;
		padding: 0 var(--space-xs);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
	}

	.folder-options-btn:hover {
		background: rgba(0, 0, 0, 0.05);
		color: var(--text-primary);
	}

	/* Options Dropdown Items styling */
	.dropdown-item {
		background: transparent;
		border: none;
		padding: var(--space-xs) var(--space-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
		cursor: pointer;
		text-align: left;
		display: flex;
		align-items: center;
		transition: background-color 0.1s var(--ease-out);
		width: 100%;
		box-sizing: border-box;
	}

	.dropdown-item:hover {
		background: var(--bg-secondary);
	}

	.dropdown-item.delete-item {
		color: var(--error);
	}

	.dropdown-item.delete-item:hover {
		background: color-mix(in srgb, var(--error) 10%, var(--bg-primary));
	}

	.folder-chip.mode-edit {
		border-color: #3d5a80;
		border-style: dashed;
	}

	.folder-chip.mode-delete {
		border-color: #e63946;
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
			border-style 0.2s var(--ease-out);
	}

	.add-folder-chip:hover {
		border-style: solid;
		background: var(--bg-secondary);
		box-shadow: 2px 2px 0px var(--text-primary);
		transform: translate(-1px, -1px);
	}

	.add-folder-chip:active {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	/* Form Styles */
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

	.form-group label,
	.form-group .label-span {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	.color-options {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.color-btn {
		flex: 1;
		min-width: calc(var(--base) * 2.3);
		max-width: calc(var(--base) * 3.4);
		height: calc(var(--base) * 2.3);
		border-radius: var(--radius-md);
		border: var(--border-width) solid var(--border-color);
		cursor: pointer;
		opacity: 0.5;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			opacity 0.2s ease;
		box-shadow: var(--shadow-sm);
	}

	.color-btn:hover {
		opacity: 0.8;
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--text-primary);
	}

	.color-btn.selected {
		opacity: 1;
		box-shadow: none;
		transform: translate(2px, 2px);
		border-width: 3px;
	}

	.color-btn.default {
		background: var(--bg-secondary);
	}
	.color-btn.blue {
		background: #3d5a80;
	}
	.color-btn.green {
		background: #2d6a4f;
	}
	.color-btn.yellow {
		background: #e9c46a;
	}
	.color-btn.purple {
		background: #9d4edd;
	}
	.color-btn.orange {
		background: #f4a261;
	}
	.color-btn.red {
		background: #e63946;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}
</style>
