#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);

const rules = [
	{ name: 'local <style> blocks', pattern: /<style(?:\s|>)/ },
	{ name: 'global selectors', pattern: /:global\s*\(/ },
	{ name: 'inline style attributes', pattern: /\sstyle=/ },
	{ name: 'Svelte style directives', pattern: /\sstyle:[\w-]+=/ },
	{ name: 'local class attributes', pattern: /\sclass(?::[\w-]+)?=/ },
	{
		name: 'legacy viewport padding presets',
		pattern: /\bpadding=["'](?:app-authenticated|page|page-wide|page-compact)["']/
	}
];

const nonAllowlistableViolations = new Set([
	'local <style> blocks',
	'global selectors',
	'inline style attributes',
	'Svelte style directives',
	'local class attributes',
	'consumer CSS beyond MonsanUI import'
]);

/**
 * @typedef {{ allowlist?: string[] }} ConsumerStandardsConfig
 * @typedef {{ root?: string; allowlist?: string[] }} CheckConsumerStandardsOptions
 */

/**
 * @param {string} root
 * @returns {Promise<Set<string>>}
 */
async function loadAllowlist(root) {
	const configPath = path.join(root, 'monsan-ui.consumer-standards.mjs');

	if (!existsSync(configPath)) return new Set();

	const config = await import(pathToFileURL(configPath).href);
	const exportedConfig = config.default ?? config.consumerStandards ?? {};
	const allowlist = Array.isArray(exportedConfig)
		? exportedConfig
		: /** @type {ConsumerStandardsConfig} */ (exportedConfig).allowlist;

	if (!Array.isArray(allowlist)) {
		throw new Error('monsan-ui.consumer-standards.mjs must export an allowlist array.');
	}

	return new Set(allowlist);
}

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function listFiles(dir) {
	if (!existsSync(dir)) return [];

	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = path.join(dir, entry.name);
			if (entry.isDirectory()) return listFiles(entryPath);
			return entryPath;
		})
	);

	return files.flat();
}

/**
 * @param {string} root
 * @param {string} filePath
 * @returns {string}
 */
function toProjectPath(root, filePath) {
	return path.relative(root, filePath).split(path.sep).join('/');
}

/**
 * @param {string} content
 * @returns {boolean}
 */
function hasNonMonsanCss(content) {
	const normalized = content
		.split('\n')
		.map((line) => line.trim())
		.filter(
			(line) => line && !line.startsWith('/*') && !line.startsWith('*') && !line.endsWith('*/')
		);

	return normalized.some((line) => line !== "@import 'monsan-ui/monsan-ui.css';");
}

/**
 * @param {string} content
 * @returns {string[]}
 */
function collectSvelteViolations(content) {
	const violations = rules.filter((rule) => rule.pattern.test(content)).map((rule) => rule.name);
	const markup = content.replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi, '');

	if (/<AppShell(?:\s|>)[\s\S]*?<main(?:\s|>)[\s\S]*?<\/AppShell>/.test(markup)) {
		violations.push('nested <main> landmark inside AppShell');
	}

	return violations;
}

/**
 * @param {CheckConsumerStandardsOptions} [options]
 * @returns {Promise<string[]>}
 */
export async function checkConsumerStandards(options = {}) {
	const root = options.root ?? process.cwd();
	const srcDir = path.join(root, 'src');
	const allowlist = options.allowlist ? new Set(options.allowlist) : await loadAllowlist(root);
	const violations = /** @type {string[]} */ ([]);

	for (const file of await listFiles(srcDir)) {
		if (!/\.(svelte|css)$/.test(file)) continue;

		const projectPath = toProjectPath(root, file);
		const content = await readFile(file, 'utf8');
		const fileViolations = file.endsWith('.svelte') ? collectSvelteViolations(content) : [];

		if (file.endsWith('.css') && hasNonMonsanCss(content)) {
			fileViolations.push('consumer CSS beyond MonsanUI import');
		}

		const hasBlockingViolation = fileViolations.some((violation) =>
			nonAllowlistableViolations.has(violation)
		);

		if (fileViolations.length > 0 && (hasBlockingViolation || !allowlist.has(projectPath))) {
			violations.push(`${projectPath}: ${fileViolations.join(', ')}`);
		}
	}

	return violations;
}

/**
 * @param {string[]} violations
 */
function printViolations(violations) {
	console.error('MonsanUI consumer standard violations found:');
	for (const violation of violations) console.error(`- ${violation}`);
	console.error(
		'\nMove visual/layout needs into MonsanUI, or add a documented migration exception.'
	);
}

function isMainModule() {
	if (!process.argv[1]) return false;
	const entry = path.resolve(process.argv[1]);
	return entry === currentFile || (existsSync(entry) && realpathSync(entry) === currentFile);
}

if (isMainModule()) {
	const violations = await checkConsumerStandards();

	if (violations.length > 0) {
		printViolations(violations);
		process.exit(1);
	}

	console.log('MonsanUI consumer standards passed.');
}
