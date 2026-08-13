import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const clientRoot = join(root, 'src');
const ignoredSegments = new Set(['node_modules', '.svelte-kit', 'dist', 'build', 'paraglide']);
const forbidden = [
	{ pattern: /\.toSorted\s*\(/, api: 'Array.prototype.toSorted (Chrome 110)' },
	{ pattern: /\.toReversed\s*\(/, api: 'Array.prototype.toReversed (Chrome 110)' },
	{ pattern: /\.toSpliced\s*\(/, api: 'Array.prototype.toSpliced (Chrome 110)' },
	{ pattern: /Array\.fromAsync\s*\(/, api: 'Array.fromAsync (Chrome 121)' },
	{ pattern: /Object\.groupBy\s*\(/, api: 'Object.groupBy (Chrome 117)' },
	{ pattern: /Map\.groupBy\s*\(/, api: 'Map.groupBy (Chrome 117)' },
	{ pattern: /Promise\.withResolvers\s*\(/, api: 'Promise.withResolvers (Chrome 119)' }
];

async function filesIn(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		if (ignoredSegments.has(entry.name)) continue;
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await filesIn(path)));
		else if (/\.(?:svelte|[cm]?[jt]s)$/.test(entry.name)) files.push(path);
	}
	return files;
}

const violations = [];
for (const file of await filesIn(clientRoot)) {
	const source = await readFile(file, 'utf8');
	for (const { pattern, api } of forbidden) {
		if (pattern.test(source)) violations.push(`${relative(root, file)} uses ${api}.`);
	}
}

if (violations.length > 0) {
	console.error('Chrome 109 browser compatibility check failed:\n' + violations.join('\n'));
	process.exit(1);
}
