import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { checkToolingStandards } from '../src/lib/standards/check-tooling-standards.js';

const validPackageJson = {
	name: 'fixture',
	private: true,
	version: '0.0.0',
	packageManager: 'pnpm@11.17.0',
	type: 'module',
	scripts: {
		lint: 'prettier --check . && eslint .'
	}
};

const validPrettierConfig = {
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

const validPrettierIgnore = `# Package Managers
package-lock.json
pnpm-lock.yaml
yarn.lock
bun.lock
bun.lockb

# Miscellaneous
/.svelte-kit/
/build/
/dist/
/node_modules/
`;

const validEslintConfig = `import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		rules: {
			'svelte/no-navigation-without-resolve': [
				'error',
				{
					ignoreGoto: true
				}
			]
		}
	}
);
`;

async function withFixture(files, test) {
	const root = await mkdtemp(path.join(os.tmpdir(), 'monsan-ui-tooling-'));

	try {
		for (const [filePath, content] of Object.entries(files)) {
			const absolutePath = path.join(root, filePath);
			await mkdir(path.dirname(absolutePath), { recursive: true });
			await writeFile(absolutePath, content, { flag: 'wx' });
		}

		await test(root);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function json(value) {
	return `${JSON.stringify(value, null, '\t')}\n`;
}

await withFixture(
	{
		'package.json': json(validPackageJson),
		'.prettierrc': json(validPrettierConfig),
		'.prettierignore': validPrettierIgnore,
		'eslint.config.js': validEslintConfig
	},
	async (root) => {
		const violations = await checkToolingStandards({ root });
		assert(violations.length === 0, `Expected valid fixture to pass, got ${violations}.`);
	}
);

await withFixture(
	{
		'package.json': json({
			...validPackageJson,
			packageManager: 'npm@10.0.0',
			scripts: { lint: 'eslint .' }
		}),
		'.prettierrc': json({ ...validPrettierConfig, useTabs: false }),
		'.prettierignore': `${validPrettierIgnore}src/**\n`,
		'eslint.config.js': validEslintConfig.replace("'svelte/no-navigation-without-resolve'", '')
	},
	async (root) => {
		const violations = await checkToolingStandards({ root });
		const report = violations.join('\n');

		assert(report.includes('pnpm@11.17.0'), `Expected pnpm violation: ${report}`);
		assert(report.includes('lint script'), `Expected lint script violation: ${report}`);
		assert(report.includes('.prettierrc'), `Expected Prettier violation: ${report}`);
		assert(report.includes('broad ignore src/**'), `Expected broad ignore violation: ${report}`);
		assert(
			report.includes('svelte/no-navigation-without-resolve'),
			`Expected navigation rule violation: ${report}`
		);
	}
);

console.log('Tooling standards tests passed.');
