import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
	createMonsanUiGitConfig,
	denyUnapprovedMonsanUiBuilds,
	updateMonsanUiBuildAllowance
} from '../scripts/propagate-monsan-ui.mjs';

const sha = '646933942b2bf0fb650144d50f983291b4d2b500';
const directory = mkdtempSync(join(tmpdir(), 'monsan-ui-propagation-test-'));
const workspacePath = join(directory, 'pnpm-workspace.yaml');

try {
	const gitConfig = createMonsanUiGitConfig('read/token');
	assert.match(gitConfig, /https:\/\/x-access-token:read%2Ftoken@github\.com\//);
	assert.match(gitConfig, /insteadOf = git@github\.com:/);
	assert.match(gitConfig, /insteadOf = ssh:\/\/git@github\.com\//);
	assert.throws(() => createMonsanUiGitConfig(''), /MONSAN_UI_READ_TOKEN/);

	writeFileSync(workspacePath, 'allowBuilds:\n  monsan-ui: true\n');
	updateMonsanUiBuildAllowance(directory, sha);
	assert.match(
		readFileSync(workspacePath, 'utf8'),
		new RegExp(`'monsan-ui@git\\+ssh://git@github\\.com/lucasmonsan/MonsanUI\\.git#${sha}'`)
	);
	assert.doesNotMatch(readFileSync(workspacePath, 'utf8'), /"monsan-ui@git\+ssh/);

	const previousSha = '7ed2ee30ad031997947207400ee0ad50262f25bd';
	writeFileSync(
		workspacePath,
		`allowBuilds:\n  'monsan-ui@git+ssh://git@github.com/lucasmonsan/MonsanUI.git#${previousSha}': true\n`
	);
	updateMonsanUiBuildAllowance(directory, sha);
	assert.match(readFileSync(workspacePath, 'utf8'), new RegExp(`'[^']*#${previousSha}': false`));
	assert.match(readFileSync(workspacePath, 'utf8'), new RegExp(`'[^']*#${sha}': true`));

	writeFileSync(
		workspacePath,
		'allowBuilds:\n  monsan-ui@git+https://git@github.com:lucasmonsan/MonsanUI.git#old: set this to true or false\n'
	);
	assert.equal(denyUnapprovedMonsanUiBuilds(directory), true);
	assert.match(readFileSync(workspacePath, 'utf8'), /MonsanUI\.git#old: false/);
	assert.equal(denyUnapprovedMonsanUiBuilds(directory), false);
} finally {
	rmSync(directory, { recursive: true, force: true });
}

console.log('MonsanUI propagation tests passed.');
