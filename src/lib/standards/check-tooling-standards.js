#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);

const expectedPrettierConfig = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	plugins: ['prettier-plugin-svelte'],
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte'
			}
		}
	]
};

const requiredPrettierIgnores = [
	'package-lock.json',
	'pnpm-lock.yaml',
	'yarn.lock',
	'bun.lock',
	'bun.lockb',
	'/.svelte-kit/',
	'/build/',
	'/dist/',
	'/node_modules/'
];

const disallowedPrettierIgnores = ['*', '/*', '/src/', 'src/', 'src/**', '**/*'];

const requiredEslintSnippets = [
	'includeIgnoreFile(gitignorePath)',
	'js.configs.recommended',
	'ts.configs.recommended',
	'svelte.configs.recommended',
	'svelte.configs.prettier',
	"'no-undef': 'off'",
	'projectService: true',
	"extraFileExtensions: ['.svelte']",
	'parser: ts.parser',
	'svelteConfig',
	"'svelte/no-navigation-without-resolve'",
	'ignoreGoto: true'
];

/**
 * @typedef {{ root?: string }} CheckToolingStandardsOptions
 */

/**
 * @param {string} filePath
 * @returns {Promise<string | null>}
 */
async function readOptionalFile(filePath) {
	if (!existsSync(filePath)) return null;
	return readFile(filePath, 'utf8');
}

/**
 * @param {unknown} actual
 * @param {unknown} expected
 * @returns {boolean}
 */
function isJsonEqual(actual, expected) {
	return JSON.stringify(actual) === JSON.stringify(expected);
}

/**
 * @param {string} content
 * @returns {string[]}
 */
function parseIgnoreLines(content) {
	return content
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith('#'));
}

/**
 * @param {string[]} violations
 * @param {string} label
 * @param {string | null} content
 * @returns {boolean}
 */
function requireFile(violations, label, content) {
	if (content !== null) return true;
	violations.push(`${label} is missing.`);
	return false;
}

/**
 * @param {CheckToolingStandardsOptions} [options]
 * @returns {Promise<string[]>}
 */
export async function checkToolingStandards(options = {}) {
	const root = options.root ?? process.cwd();
	const violations = /** @type {string[]} */ ([]);

	const packageJsonContent = await readOptionalFile(path.join(root, 'package.json'));
	if (requireFile(violations, 'package.json', packageJsonContent)) {
		const packageJson = JSON.parse(/** @type {string} */ (packageJsonContent));
		if (packageJson.packageManager !== 'pnpm@11.5.0') {
			violations.push('package.json must use packageManager "pnpm@11.5.0".');
		}
		if (packageJson.type !== 'module') {
			violations.push('package.json must use type "module".');
		}
		if (packageJson.scripts?.lint !== 'prettier --check . && eslint .') {
			violations.push('package.json lint script must be "prettier --check . && eslint .".');
		}
	}

	const prettierContent = await readOptionalFile(path.join(root, '.prettierrc'));
	if (requireFile(violations, '.prettierrc', prettierContent)) {
		const prettierConfig = JSON.parse(/** @type {string} */ (prettierContent));
		if (!isJsonEqual(prettierConfig, expectedPrettierConfig)) {
			violations.push('.prettierrc must match the Monsan suite Prettier config.');
		}
	}

	const prettierIgnoreContent = await readOptionalFile(path.join(root, '.prettierignore'));
	if (requireFile(violations, '.prettierignore', prettierIgnoreContent)) {
		const ignoreLines = parseIgnoreLines(/** @type {string} */ (prettierIgnoreContent));
		for (const requiredIgnore of requiredPrettierIgnores) {
			if (!ignoreLines.includes(requiredIgnore)) {
				violations.push(`.prettierignore must include ${requiredIgnore}.`);
			}
		}
		for (const disallowedIgnore of disallowedPrettierIgnores) {
			if (ignoreLines.includes(disallowedIgnore)) {
				violations.push(`.prettierignore must not include broad ignore ${disallowedIgnore}.`);
			}
		}
	}

	const eslintContent = await readOptionalFile(path.join(root, 'eslint.config.js'));
	if (requireFile(violations, 'eslint.config.js', eslintContent)) {
		for (const snippet of requiredEslintSnippets) {
			if (!eslintContent?.includes(snippet)) {
				violations.push(`eslint.config.js must include ${snippet}.`);
			}
		}
	}

	return violations;
}

/**
 * @param {string[]} violations
 */
function printViolations(violations) {
	console.error('Monsan suite tooling standard violations found:');
	for (const violation of violations) console.error(`- ${violation}`);
	console.error('\nUse the shared ESLint and Prettier contract before opening a PR.');
}

function isMainModule() {
	if (!process.argv[1]) return false;
	const entry = path.resolve(process.argv[1]);
	return entry === currentFile || (existsSync(entry) && realpathSync(entry) === currentFile);
}

if (isMainModule()) {
	const violations = await checkToolingStandards();

	if (violations.length > 0) {
		printViolations(violations);
		process.exit(1);
	}

	console.log('Monsan suite tooling standards passed.');
}
