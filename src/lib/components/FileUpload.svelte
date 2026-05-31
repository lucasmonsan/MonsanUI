<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'type' | 'files'> {
		files?: FileList | null;
		accept?: string;
		multiple?: boolean;
		disabled?: boolean;
		placeholder?: string;
		variant?: 'default' | 'invisible' | 'compact' | 'overlay';
		/** Trigger snippet for variant="invisible". */
		trigger?: Snippet<[{ open: () => void }]>;
		/** Button text for variants that show a browse button. */
		buttonLabel?: string;
	}

	let {
		files = $bindable(null),
		accept = '',
		multiple = false,
		disabled = false,
		placeholder,
		variant = 'default',
		trigger,
		buttonLabel,
		...rest
	}: Props = $props();

	let activePlaceholder = $derived(placeholder ?? i18n.t('fileUpload.placeholder'));
	let activeButtonLabel = $derived(buttonLabel ?? i18n.t('fileUpload.buttonLabel'));

	const fallbackId = `file-input-${Math.random().toString(36).slice(2, 11)}`;
	const inputId = $derived(rest.id || fallbackId);

	let fileInputEl = $state<HTMLInputElement>();
	let isDragOver = $state(false);
	let isWindowDragOver = $state(false);
	let windowDragCounter = $state(0);

	function open() {
		if (!disabled) fileInputEl?.click();
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (disabled) return;
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (disabled) return;
		isDragOver = false;
		isWindowDragOver = false;
		windowDragCounter = 0;
		applyFiles(e.dataTransfer?.files ?? null);
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			files = target.files;
		}
	}

	function applyFiles(incoming: FileList | null) {
		if (!incoming || incoming.length === 0) return;
		if (multiple) {
			files = incoming;
		} else {
			const dt = new DataTransfer();
			dt.items.add(incoming[0]);
			files = dt.files;
		}
	}

	function removeFile(index: number, e: MouseEvent) {
		e.stopPropagation();
		if (disabled || !files) return;

		const dt = new DataTransfer();
		for (let i = 0; i < files.length; i++) {
			if (i !== index) dt.items.add(files[i]);
		}
		files = dt.files.length > 0 ? dt.files : null;
	}

	function formatSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	let compactLabel = $derived(
		files && files.length > 0
			? files.length === 1
				? files[0].name
				: i18n.t('fileUpload.filesSelected', { count: files.length })
			: null
	);

	$effect(() => {
		if (variant !== 'overlay') return;

		function onWindowDragEnter(e: DragEvent) {
			if (disabled) return;
			if (e.dataTransfer?.types.includes('Files')) {
				windowDragCounter++;
				isWindowDragOver = true;
			}
		}
		function onWindowDragLeave() {
			windowDragCounter = Math.max(0, windowDragCounter - 1);
			if (windowDragCounter === 0) isWindowDragOver = false;
		}
		function onWindowDragOver(e: DragEvent) {
			if (e.dataTransfer?.types.includes('Files')) {
				e.preventDefault();
			}
		}
		function onWindowDrop(e: DragEvent) {
			if (!e.dataTransfer?.types.includes('Files')) return;
			e.preventDefault();
			isWindowDragOver = false;
			windowDragCounter = 0;
			applyFiles(e.dataTransfer?.files ?? null);
		}

		window.addEventListener('dragenter', onWindowDragEnter);
		window.addEventListener('dragleave', onWindowDragLeave);
		window.addEventListener('dragover', onWindowDragOver);
		window.addEventListener('drop', onWindowDrop);

		return () => {
			window.removeEventListener('dragenter', onWindowDragEnter);
			window.removeEventListener('dragleave', onWindowDragLeave);
			window.removeEventListener('dragover', onWindowDragOver);
			window.removeEventListener('drop', onWindowDrop);
		};
	});
</script>

<input
	bind:this={fileInputEl}
	id={inputId}
	type="file"
	{accept}
	{multiple}
	{disabled}
	class="sr-only"
	onchange={handleFileChange}
	{...rest}
/>

{#if variant === 'invisible'}
	{#if trigger}
		{@render trigger({ open })}
	{/if}
{:else if variant === 'compact'}
	<div class="monsan-file-upload-container monsan-file-compact ">
		<div class="compact-row">
			<button
				type="button"
				class="compact-btn"
				class:disabled
				{disabled}
				onclick={open}
				aria-label={activeButtonLabel}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
					class="compact-icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
					/>
				</svg>
				{activeButtonLabel}
			</button>
			{#if compactLabel}
				<span class="compact-file-label">{compactLabel}</span>
			{:else}
				<span class="compact-placeholder">{activePlaceholder}</span>
			{/if}
		</div>

		{#if files && files.length > 1}
			<div class="compact-file-list">
				{#each Array.from(files) as file, index (file.name + file.size + index)}
					<div class="compact-file-item">
						<span class="compact-file-name" title={file.name}>{file.name}</span>
						<span class="compact-file-size">{formatSize(file.size)}</span>
						<button
							type="button"
							class="compact-remove-btn"
							{disabled}
							onclick={(e) => removeFile(index, e)}
							aria-label={i18n.t('fileUpload.removeFile')}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2.5"
								stroke="currentColor"
								class="compact-remove-icon"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else if variant === 'overlay'}
	<div class="monsan-file-upload-container ">
		<div class="overlay-hint" class:disabled>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="overlay-hint-icon"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
				/>
			</svg>
			<span class="overlay-hint-text">{activePlaceholder}</span>
			<button type="button" class="overlay-browse-btn" class:disabled {disabled} onclick={open}>
				{activeButtonLabel}
			</button>
		</div>

		{#if isWindowDragOver && !disabled}
			<div class="overlay-fullscreen" role="region" aria-live="polite">
				<div class="overlay-drop-zone">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="overlay-drop-icon"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
						/>
					</svg>
					<p class="overlay-drop-text">{i18n.t('fileUpload.dropHere')}</p>
				</div>
			</div>
		{/if}

		{#if files && files.length > 0}
			<div class="file-list-preview">
				{#each Array.from(files) as file, index (file.name + file.size + index)}
					<div class="file-item-card" class:disabled>
						<div class="file-info-col">
							<span class="file-name" title={file.name}>{file.name}</span>
							<span class="file-size">{formatSize(file.size)}</span>
						</div>
						<button
							type="button"
							class="file-remove-btn"
							{disabled}
							onclick={(e) => removeFile(index, e)}
							aria-label={i18n.t('fileUpload.removeFile')}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2.5"
								stroke="currentColor"
								class="remove-icon"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="monsan-file-upload-container ">
		<label
			for={inputId}
			class="monsan-file-dropzone"
			class:dragover={isDragOver}
			class:disabled
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
		>
			<div class="dropzone-content">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
					class="upload-icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
					/>
				</svg>
				<span class="placeholder-text">{activePlaceholder}</span>
			</div>
		</label>

		{#if files && files.length > 0}
			<div class="file-list-preview">
				{#each Array.from(files) as file, index (file.name + file.size + index)}
					<div class="file-item-card" class:disabled>
						<div class="file-info-col">
							<span class="file-name" title={file.name}>{file.name}</span>
							<span class="file-size">{formatSize(file.size)}</span>
						</div>
						<button
							type="button"
							class="file-remove-btn"
							{disabled}
							onclick={(e) => removeFile(index, e)}
							aria-label={i18n.t('fileUpload.removeFile')}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2.5"
								stroke="currentColor"
								class="remove-icon"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	/* ============================================================
	   SHARED
	   ============================================================ */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.monsan-file-upload-container {
		width: 100%;
		font-family: var(--font-body);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		position: relative;
	}

	/* ============================================================
	   DEFAULT VARIANT
	   ============================================================ */
	.monsan-file-dropzone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		min-height: 120px;
		border: 2px dashed var(--border-color);
		border-radius: var(--radius-md);
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		padding: var(--space-lg);
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out),
			background-color 0.2s var(--ease-out);
	}

	.monsan-file-dropzone:hover:not(.disabled) {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.monsan-file-dropzone.dragover:not(.disabled) {
		background-color: var(--bg-secondary);
		border-style: solid;
		border-color: var(--accent-primary);
		transform: translate(-2px, -2px);
		box-shadow: 4px 4px 0px var(--accent-primary);
	}

	.monsan-file-dropzone.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.dropzone-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		text-align: center;
	}

	.upload-icon {
		width: 32px;
		height: 32px;
		color: var(--text-secondary);
	}

	.placeholder-text {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-secondary);
	}

	/* ============================================================
	   FILE LIST (shared between default and overlay)
	   ============================================================ */
	.file-list-preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		max-height: 200px;
		overflow-y: auto;
		padding-right: var(--space-xs);
	}

	.file-item-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-sm) var(--space-md);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}

	.file-info-col {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.file-name {
		font-size: var(--text-sm);
		font-weight: bold;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-size {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.file-remove-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: var(--space-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		border-radius: var(--radius-sm);
		transition: color 0.2s ease;
		flex-shrink: 0;
	}

	.file-remove-btn:hover:not(:disabled) {
		color: var(--accent-primary);
	}

	.file-remove-btn:disabled {
		cursor: not-allowed;
	}

	.remove-icon {
		width: 18px;
		height: 18px;
	}

	/* ============================================================
	   COMPACT VARIANT
	   ============================================================ */
	.monsan-file-compact {
		gap: var(--space-sm);
	}

	.compact-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.compact-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		height: var(--control-height);
		padding: 0 var(--space-md);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text-primary);
		cursor: pointer;
		white-space: nowrap;
		transition:
			transform 0.15s var(--ease-out),
			box-shadow 0.15s var(--ease-out);
	}

	.compact-btn:hover:not(.disabled):not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.compact-btn:active:not(.disabled):not(:disabled) {
		transform: translate(0, 0);
		box-shadow: var(--shadow-sm);
	}

	.compact-btn.disabled,
	.compact-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.compact-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.compact-file-label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 200px;
	}

	.compact-placeholder {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-style: italic;
	}

	.compact-file-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.compact-file-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm);
		background-color: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
	}

	.compact-file-name {
		flex: 1;
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.compact-file-size {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.compact-remove-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 2px;
		display: flex;
		align-items: center;
		color: var(--text-secondary);
		border-radius: var(--radius-sm);
		transition: color 0.15s ease;
		flex-shrink: 0;
	}

	.compact-remove-btn:hover:not(:disabled) {
		color: var(--accent-primary);
	}

	.compact-remove-btn:disabled {
		cursor: not-allowed;
	}

	.compact-remove-icon {
		width: 14px;
		height: 14px;
	}

	/* ============================================================
	   OVERLAY VARIANT
	   ============================================================ */
	.overlay-hint {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-lg);
		border: var(--border-width) dashed var(--border-color);
		border-radius: var(--radius-md);
		background-color: var(--bg-secondary);
		text-align: center;
	}

	.overlay-hint.disabled {
		opacity: 0.6;
	}

	.overlay-hint-icon {
		width: 28px;
		height: 28px;
		color: var(--text-secondary);
	}

	.overlay-hint-text {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-weight: 500;
	}

	.overlay-browse-btn {
		display: inline-flex;
		align-items: center;
		height: calc(var(--control-height) * 0.85);
		padding: 0 var(--space-md);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text-primary);
		cursor: pointer;
		transition:
			transform 0.15s var(--ease-out),
			box-shadow 0.15s var(--ease-out);
	}

	.overlay-browse-btn:hover:not(.disabled):not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.overlay-browse-btn:active:not(.disabled):not(:disabled) {
		transform: translate(0, 0);
		box-shadow: var(--shadow-sm);
	}

	.overlay-browse-btn.disabled,
	.overlay-browse-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Overlay fullscreen */
	.overlay-fullscreen {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background-color: rgba(45, 36, 34, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(4px);
		animation: overlayFadeIn 0.15s var(--ease-out);
	}

	@keyframes overlayFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.overlay-drop-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
		padding: var(--space-2xl);
		background-color: var(--bg-primary);
		border: 3px solid var(--accent-primary);
		border-radius: var(--radius-lg);
		box-shadow: 8px 8px 0px var(--accent-primary);
		min-width: 280px;
		animation: overlayScaleIn 0.2s var(--ease-out);
	}

	@keyframes overlayScaleIn {
		from {
			transform: scale(0.92);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.overlay-drop-icon {
		width: 48px;
		height: 48px;
		color: var(--accent-primary);
	}

	.overlay-drop-text {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text-primary);
		text-align: center;
	}
</style>
