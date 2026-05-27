<script lang="ts">
	import { onMount, tick } from 'svelte';

	export type VFSNode = { type: 'dir'; children: Record<string, VFSNode> } | { type: 'file' };

	export interface TerminalMessages {
		welcome?: (mode: string) => string;
		unrecognized?: (cmd: string) => string;
		pathNotFound?: string;
		destExists?: string;
		originalNotFound?: string;
		usageMv?: string;
		fileNotFoundSimple?: string;
		usageRm?: string;
		fileNotFound?: string;
		contentDisplayed?: (file: string) => string;
		usageType?: string;
		usageTouch?: string;
		dirNotFound?: string;
		notEmpty?: (target: string) => string;
		cannotRemoveHome?: string;
		usageRmdir?: string;
		exists?: (name: string) => string;
		usageMkdir?: string;
		emptyDir?: string;
		lostDir?: string;
		cmdNotAvailable?: (cmd: string, mode: string) => string;
		errorProcess?: string;
		tabTerminal?: string;
		tabFiles?: string;
		explorerHeader?: string;
		explorerRoot?: string;
		itemExists?: (target: string) => string;
	}

	interface Props {
		initialVFS?: Record<string, VFSNode>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		value?: any;
		disabled?: boolean;
		osMode?: 'linux' | 'windows' | 'both';
		messages?: TerminalMessages;
	}

	let {
		initialVFS = {},
		value = $bindable(),
		disabled = false,
		osMode = 'both',
		messages = {}
	}: Props = $props();

	// Merged messages with Portuguese/English fallback defaults
	const mergedMessages = $derived({
		welcome:
			messages.welcome ||
			((mode: string) => `Bem-vindo ao simulador de terminal interativo!${mode}`),
		unrecognized: messages.unrecognized || ((cmd: string) => `Comando '${cmd}' não reconhecido.`),
		pathNotFound: messages.pathNotFound || 'Caminho não encontrado.',
		destExists: messages.destExists || 'Destino já existe.',
		originalNotFound: messages.originalNotFound || 'Origem não encontrada.',
		usageMv: messages.usageMv || 'Uso: mv <origem> <destino>',
		fileNotFoundSimple: messages.fileNotFoundSimple || 'Arquivo não encontrado.',
		usageRm: messages.usageRm || 'Uso: rm <nome_do_arquivo>',
		fileNotFound: messages.fileNotFound || 'Arquivo não encontrado.',
		contentDisplayed:
			messages.contentDisplayed || ((file: string) => `[Conteúdo do arquivo ${file}]`),
		usageType: messages.usageType || 'Uso: type <nome_do_arquivo>',
		usageTouch: messages.usageTouch || 'Uso: touch <nome_do_arquivo>',
		dirNotFound: messages.dirNotFound || 'Diretório não encontrado.',
		notEmpty: messages.notEmpty || ((target: string) => `Diretório '${target}' não está vazio.`),
		cannotRemoveHome: messages.cannotRemoveHome || 'Não é possível remover a pasta home.',
		usageRmdir: messages.usageRmdir || 'Uso: rmdir <nome_da_pasta>',
		exists: messages.exists || ((name: string) => `'${name}' já existe.`),
		usageMkdir: messages.usageMkdir || 'Uso: mkdir <nome_da_pasta>',
		emptyDir: messages.emptyDir || '[Diretório vazio]',
		lostDir: messages.lostDir || 'Diretório atual não encontrado. Retornando para /home.',
		cmdNotAvailable:
			messages.cmdNotAvailable ||
			((cmd: string, mode: string) => `Comando '${cmd}' não disponível no modo ${mode}.`),
		errorProcess: messages.errorProcess || 'Erro ao processar comando.',
		tabTerminal: messages.tabTerminal || 'Terminal',
		tabFiles: messages.tabFiles || 'Arquivos',
		explorerHeader: messages.explorerHeader || 'Explorador de Arquivos',
		explorerRoot: messages.explorerRoot || 'raiz',
		itemExists: messages.itemExists || ((target: string) => `Destino '${target}' já existe.`)
	});

	let vfs = $state(createInitialVFS());
	let currentPath = $state(['home']);
	let history = $state<{ id: string; type: 'cmd' | 'output' | 'error'; text: string }[]>([]);
	let currentInput = $state('');
	let terminalElement = $state<HTMLElement | null>(null);
	let activeTab = $state<'terminal' | 'explorer'>('terminal');

	function createInitialVFS(): Record<string, VFSNode> {
		const source =
			value && typeof value === 'object' && Object.keys(value).length > 0 ? value : initialVFS;
		if (source && Object.keys(source).length > 0)
			return JSON.parse(JSON.stringify(source)) as Record<string, VFSNode>;
		return { home: { type: 'dir', children: {} } };
	}

	let pathString = $derived('/' + currentPath.join('/'));

	$effect(() => {
		value = JSON.parse(JSON.stringify(vfs));
	});

	function getDir(path: string[]): Record<string, VFSNode> | null {
		let curr = vfs;
		if (path.length === 0) return curr;
		for (const p of path) {
			if (!curr[p] || curr[p].type !== 'dir') return null;
			curr = curr[p].children;
		}
		return curr;
	}

	async function scrollBottom() {
		await tick();
		if (terminalElement) terminalElement.scrollTop = terminalElement.scrollHeight;
	}

	function handleCommand(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			const rawInput = currentInput.trim();
			if (disabled || !rawInput) {
				currentInput = '';
				return;
			}

			history.push({
				id: Math.random().toString(36),
				type: 'cmd',
				text: `${pathString}$ ${rawInput}`
			});

			try {
				if (rawInput.includes('>')) {
					const parts = rawInput.split('>');
					const left = parts[0].trim().split(' ');
					const targetFile = parts[1].trim();
					executeCommand(left[0].toLowerCase(), left.slice(1), targetFile);
				} else {
					const [cmd, ...args] = rawInput.split(' ');
					executeCommand(cmd.toLowerCase(), args);
				}
			} catch {
				history.push({
					id: Math.random().toString(36),
					type: 'error',
					text: mergedMessages.errorProcess
				});
			} finally {
				currentInput = '';
				scrollBottom();
			}
		}
	}

	function isCommandAllowed(cmd: string) {
		if (osMode === 'both') return true;
		const linuxCmds = ['ls', 'mkdir', 'rmdir', 'touch', 'rm', 'clear', 'pwd', 'cd', 'mv'];
		const windowsCmds = ['dir', 'md', 'rd', 'type', 'del', 'cls', 'cd', 'copy', 'ren'];
		if (osMode === 'linux') return linuxCmds.includes(cmd);
		if (osMode === 'windows') return windowsCmds.includes(cmd);
		return true;
	}

	function executeCommand(cmd: string, args: string[], redirectTarget?: string) {
		if (!isCommandAllowed(cmd)) {
			return history.push({
				id: Math.random().toString(36),
				type: 'error',
				text: mergedMessages.cmdNotAvailable(cmd, osMode)
			});
		}

		const currentDir = getDir(currentPath);
		if (!currentDir) {
			currentPath = ['home'];
			return history.push({
				id: Math.random().toString(36),
				type: 'error',
				text: mergedMessages.lostDir
			});
		}

		if (redirectTarget) {
			if (currentDir[redirectTarget])
				return history.push({
					id: Math.random().toString(36),
					type: 'error',
					text: mergedMessages.itemExists(redirectTarget)
				});
			currentDir[redirectTarget] = { type: 'file' };
			return;
		}

		switch (cmd) {
			case 'help': {
				if (osMode === 'linux' || osMode === 'both')
					history.push({
						id: Math.random().toString(36),
						type: 'output',
						text: 'Linux: ls, cd, mkdir, rmdir, touch, rm, mv, clear'
					});
				if (osMode === 'windows' || osMode === 'both')
					history.push({
						id: Math.random().toString(36),
						type: 'output',
						text: 'Windows: dir, cd, md, rd, type, del, ren, cls'
					});
				break;
			}
			case 'clear':
			case 'cls':
				history = [];
				break;
			case 'pwd':
				history.push({ id: Math.random().toString(36), type: 'output', text: pathString });
				break;
			case 'ls':
			case 'dir': {
				const items = Object.keys(currentDir);
				history.push({
					id: Math.random().toString(36),
					type: 'output',
					text: items.length ? items.join('   ') : mergedMessages.emptyDir
				});
				break;
			}
			case 'mkdir':
			case 'md': {
				const folderName = args[0];
				if (!folderName)
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.usageMkdir
					});
				if (currentDir[folderName])
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.exists(folderName)
					});
				currentDir[folderName] = { type: 'dir', children: {} };
				break;
			}
			case 'rmdir':
			case 'rd': {
				const targetDir = args[0];
				if (!targetDir)
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.usageRmdir
					});
				if (targetDir === 'home')
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.cannotRemoveHome
					});
				const dirObj = currentDir[targetDir];
				if (dirObj && dirObj.type === 'dir') {
					if (Object.keys(dirObj.children).length > 0)
						return history.push({
							id: Math.random().toString(36),
							type: 'error',
							text: mergedMessages.notEmpty(targetDir)
						});
					delete currentDir[targetDir];
				} else
					history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.dirNotFound
					});
				break;
			}
			case 'touch': {
				const fileName = args[0];
				if (!fileName)
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.usageTouch
					});
				if (currentDir[fileName])
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.exists(fileName)
					});
				currentDir[fileName] = { type: 'file' };
				break;
			}
			case 'type': {
				const fileToRead = args[0];
				if (!fileToRead)
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.usageType
					});
				if (currentDir[fileToRead]?.type === 'file') {
					history.push({
						id: Math.random().toString(36),
						type: 'output',
						text: mergedMessages.contentDisplayed(fileToRead)
					});
				} else {
					history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.fileNotFound
					});
				}
				break;
			}
			case 'rm':
			case 'del': {
				const fileToDelete = args[0];
				if (!fileToDelete)
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.usageRm
					});
				if (currentDir[fileToDelete]?.type === 'file') delete currentDir[fileToDelete];
				else
					history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.fileNotFoundSimple
					});
				break;
			}
			case 'ren':
			case 'mv': {
				const oldName = args[0];
				const newName = args[1];
				if (!oldName || !newName)
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.usageMv
					});
				if (!currentDir[oldName])
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.originalNotFound
					});
				if (currentDir[newName])
					return history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.destExists
					});
				currentDir[newName] = currentDir[oldName];
				delete currentDir[oldName];
				break;
			}
			case 'cd': {
				const target = args[0];
				if (!target || target === '.') return;
				if (target === '..') {
					if (currentPath.length > 0) currentPath.pop();
				} else if (target === '/') currentPath = [];
				else if (currentDir[target]?.type === 'dir') currentPath.push(target);
				else
					history.push({
						id: Math.random().toString(36),
						type: 'error',
						text: mergedMessages.pathNotFound
					});
				break;
			}
			default:
				history.push({
					id: Math.random().toString(36),
					type: 'error',
					text: mergedMessages.unrecognized(cmd)
				});
		}
	}

	onMount(() => {
		const modeDisplay = osMode === 'both' ? '' : ` (${osMode.toUpperCase()})`;
		history.push({ id: 'init', type: 'output', text: mergedMessages.welcome(modeDisplay) });
	});

	let isFirstEffectRun = true;
	// Focus active tab (skipping the first run to prevent page-load hijack)
	$effect(() => {
		if (activeTab === 'terminal') {
			if (isFirstEffectRun) {
				isFirstEffectRun = false;
				return;
			}
			document.getElementById('term-input')?.focus();
		}
	});

	let terminalWrapperEl = $state<HTMLDivElement>();
	$effect(() => {
		if (terminalWrapperEl) {
			const listener = () => {
				document.getElementById('term-input')?.focus();
			};
			terminalWrapperEl.addEventListener('click', listener);
			return () => terminalWrapperEl?.removeEventListener('click', listener);
		}
	});
</script>

{#snippet tree(nodes: Record<string, VFSNode>, depth = 0, parentPath: string[] = [])}
	{#each Object.entries(nodes) as [name, node] (name)}
		{@const fullPath = [...parentPath, name]}
		{@const isActive = pathString === '/' + fullPath.join('/')}
		<div class="tree-line" class:active={isActive} style="padding-left: {depth * 15 + 10}px">
			{#if node.type === 'dir'}
				<svg class="icon-folder" viewBox="0 0 24 24" width="14" height="14"
					><path
						fill="currentColor"
						d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
					/></svg
				>
				<span class="name folder">{name}</span>
			{:else}
				<svg class="icon-file" viewBox="0 0 24 24" width="14" height="14"
					><path
						fill="currentColor"
						d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
					/></svg
				>
				<span class="name file">{name}</span>
			{/if}
		</div>
		{#if node.type === 'dir' && node.children}
			{@render tree(node.children, depth + 1, fullPath)}
		{/if}
	{/each}
{/snippet}

<div class="terminal-container">
	<div class="mobile-tabs">
		<button class:active={activeTab === 'terminal'} onclick={() => (activeTab = 'terminal')}
			>{mergedMessages.tabTerminal}</button
		>
		<button class:active={activeTab === 'explorer'} onclick={() => (activeTab = 'explorer')}
			>{mergedMessages.tabFiles}</button
		>
	</div>

	<aside class="explorer-sidebar" class:hidden-mobile={activeTab !== 'explorer'}>
		<div class="explorer-header">{mergedMessages.explorerHeader}</div>
		<div class="tree-root">
			<div class="tree-line root" class:active={pathString === '/'}>
				<svg viewBox="0 0 24 24" width="14" height="14"
					><path
						fill="currentColor"
						d="M4 6V4h16v2H4zm0 5h16v-2H4v2zm0 5h16v-2H4v2zm0 4h16v-2H4v2z"
					/></svg
				>
				<span>{mergedMessages.explorerRoot}</span>
			</div>
			{@render tree(vfs, 1, [])}
		</div>
	</aside>

	<div
		bind:this={terminalWrapperEl}
		class="terminal-wrapper"
		class:hidden-mobile={activeTab === 'explorer'}
	>
		<div class="terminal-content" bind:this={terminalElement}>
			{#each history as line (line.id)}
				<div class="line {line.type}">{line.text}</div>
			{/each}
			<div class="input-line">
				<span class="prompt">{pathString}$</span>
				<input
					id="term-input"
					type="text"
					bind:value={currentInput}
					onkeydown={handleCommand}
					autocomplete="off"
					spellcheck="false"
					{disabled}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.terminal-container {
		display: grid;
		grid-template-columns: 220px 1fr;
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		overflow: hidden;
		border: var(--border-width) solid var(--border-color);
		height: 420px;
	}

	.mobile-tabs {
		display: none;
	}

	.explorer-sidebar {
		background: var(--bg-primary);
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		display: flex;
		flex-direction: column;
		border-right: var(--border-width) solid var(--border-color);
	}

	.explorer-header {
		padding: var(--space-md);
		font-size: calc(var(--base) * 0.75);
		font-weight: 800;
		color: var(--text-secondary);
		letter-spacing: 0.05em;
		border-bottom: var(--border-width) solid var(--border-color);
	}

	.tree-root {
		flex: 1;
		overflow-y: auto;
		overflow-x: auto;
		padding: var(--space-sm) 0;
	}

	.tree-line {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-md);
		white-space: nowrap;
		border-left: 3px solid transparent;
	}

	.tree-line.active {
		background: var(--grid-color);
		color: var(--text-primary);
		border-left-color: var(--success);
	}

	.tree-line:hover {
		background: var(--grid-color);
	}
	.tree-line.root {
		color: var(--success);
		font-size: calc(var(--base) * 0.75);
		margin-bottom: var(--space-xs);
	}

	.name.folder {
		color: var(--accent-primary);
	}
	.name.file {
		color: var(--text-primary);
	}
	.icon-folder {
		color: var(--accent-primary);
	}
	.icon-file {
		color: var(--text-secondary);
	}

	.terminal-wrapper {
		background: var(--bg-secondary);
		color: var(--success);
		font-family: 'JetBrains Mono', monospace;
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.terminal-content {
		flex: 1;
	}
	.line {
		margin-bottom: 3px;
		font-size: var(--text-sm);
		line-height: 1.5;
	}
	.cmd {
		color: var(--text-primary);
	}
	.error {
		color: var(--error);
		font-weight: bold;
	}
	.output {
		color: var(--success);
	}

	.input-line {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
	}
	.prompt {
		color: var(--success);
		font-weight: bold;
	}
	input {
		background: transparent;
		border: none;
		color: var(--text-primary);
		font-family: inherit;
		font-size: var(--text-sm);
		flex: 1;
		outline: none;
	}

	@media (max-width: 650px) {
		.terminal-container {
			grid-template-columns: 100%;
			grid-template-rows: auto 1fr;
			height: 500px;
			width: 100%;
			max-width: 100%;
			box-sizing: border-box;
		}
		.mobile-tabs {
			display: flex;
			background: var(--bg-primary);
			border-bottom: var(--border-width) solid var(--border-color);
			width: 100%;
			box-sizing: border-box;
		}
		.mobile-tabs button {
			flex: 1;
			padding: var(--space-md);
			background: transparent;
			border: none;
			color: var(--text-secondary);
			font-size: calc(var(--base) * 0.75);
			font-weight: bold;
			text-transform: uppercase;
		}
		.mobile-tabs button.active {
			color: var(--success);
			border-bottom: var(--border-width) solid var(--success);
			background: var(--grid-color);
		}
		.hidden-mobile {
			display: none !important;
		}
		.explorer-sidebar {
			border-right: none;
			width: 100%;
			max-width: 100%;
			box-sizing: border-box;
		}
		.terminal-wrapper {
			width: 100%;
			max-width: 100%;
			box-sizing: border-box;
		}
	}
</style>
