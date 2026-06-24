import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { checkConsumerStandards } from '../src/lib/standards/check-consumer-standards.js';

async function withFixture(files, test) {
	const root = await mkdtemp(path.join(os.tmpdir(), 'monsan-ui-standards-'));

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

await withFixture(
	{
		'src/app.css': "@import 'monsan-ui/monsan-ui.css';\n",
		'src/routes/+page.svelte':
			'<script lang="ts">const title = "Clean";</script>\n<h1>{title}</h1>\n'
	},
	async (root) => {
		const violations = await checkConsumerStandards({ root });

		assert(violations.length === 0, `Expected clean fixture to pass, got ${violations}.`);
	}
);

await withFixture(
	{
		'src/app.css': "@import 'monsan-ui/monsan-ui.css';\n",
		'src/routes/+page.svelte':
			'<script>import { AppViewport } from "monsan-ui";</script><AppViewport padding="app-authenticated">Content</AppViewport>\n'
	},
	async (root) => {
		const violations = await checkConsumerStandards({ root });
		const report = violations.join('\n');

		assert(
			report.includes('legacy viewport padding presets'),
			`Expected legacy viewport padding violation: ${report}`
		);
	}
);

await withFixture(
	{
		'src/app.css': "@import 'monsan-ui/monsan-ui.css';\n",
		'src/routes/+page.svelte':
			'<script>const example = "<main>Example</main>";</script>\n<AppShell><main>Content</main></AppShell>\n'
	},
	async (root) => {
		const violations = await checkConsumerStandards({ root });
		const report = violations.join('\n');

		assert(
			report.includes('nested <main> landmark inside AppShell'),
			`Expected nested main landmark violation: ${report}`
		);
	}
);

await withFixture(
	{
		'src/app.css': "@import 'monsan-ui/monsan-ui.css';\n",
		'src/routes/+page.svelte':
			'<script>const example = "<main>Example</main>";</script>\n<AppShell><section>Content</section></AppShell>\n'
	},
	async (root) => {
		const violations = await checkConsumerStandards({ root });

		assert(
			violations.length === 0,
			`Expected script example and section content to pass, got ${violations}.`
		);
	}
);

await withFixture(
	{
		'src/app.css': "@import 'monsan-ui/monsan-ui.css';\nbody { color: red; }\n",
		'src/routes/+page.svelte': '<div class="local"><style>.local { color: red; }</style></div>\n'
	},
	async (root) => {
		const violations = await checkConsumerStandards({ root });
		const report = violations.join('\n');

		assert(
			report.includes('local <style> blocks'),
			`Expected local style block violation: ${report}`
		);
		assert(report.includes('local class attributes'), `Expected local class violation: ${report}`);
		assert(
			report.includes('consumer CSS beyond MonsanUI import'),
			`Expected CSS violation: ${report}`
		);
	}
);

await withFixture(
	{
		'monsan-ui.consumer-standards.mjs':
			"export default { allowlist: ['src/routes/+page.svelte'] };\n",
		'src/app.css': "@import 'monsan-ui/monsan-ui.css';\n",
		'src/routes/+page.svelte':
			'<div class="temporary"><style>.temporary { color: red; }</style></div>\n'
	},
	async (root) => {
		const violations = await checkConsumerStandards({ root });

		assert(violations.length === 0, `Expected allowlisted fixture to pass, got ${violations}.`);
	}
);

console.log('Consumer standards tests passed.');
