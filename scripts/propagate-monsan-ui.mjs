import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MONSAN_UI_REPOSITORY = 'lucasmonsan/MonsanUI';
const CONSUMERS = ['Crocode', 'Koalify', 'Manki', 'Monsan', 'Owlth', 'Rooster'];
const DEFAULT_BRANCH = 'main';

function requireMonsanUiSha() {
	const sha = process.env.MONSAN_UI_SHA;
	if (!sha || !/^[0-9a-f]{40}$/i.test(sha)) {
		throw new Error('MONSAN_UI_SHA must be a full Git commit SHA.');
	}

	return sha.toLowerCase();
}

function run(command, argumentsList, cwd) {
	const result = spawnSync(command, argumentsList, {
		cwd,
		env: process.env,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	});

	if (result.error) {
		throw new Error(`Could not run ${command}: ${result.error.message}`);
	}
	if (result.status !== 0) {
		throw new Error(`${command} exited with code ${result.status ?? 'unknown'}.`);
	}

	return result.stdout;
}

function runVisible(command, argumentsList, cwd, environment = process.env) {
	const result = runVisibleResult(command, argumentsList, cwd, environment);
	if (result.status !== 0) {
		throw new Error(`${command} exited with code ${result.status ?? 'unknown'}.`);
	}
}

function runVisibleResult(command, argumentsList, cwd, environment = process.env) {
	const result = spawnSync(command, argumentsList, {
		cwd,
		env: environment,
		stdio: 'inherit'
	});

	if (result.error) {
		throw new Error(`Could not run ${command}: ${result.error.message}`);
	}

	return result;
}

function unprivilegedEnvironment() {
	const environment = { ...process.env };
	delete environment.GH_TOKEN;
	return environment;
}

function hasOpenPullRequest(repository, branch) {
	const output = run('gh', [
		'pr',
		'list',
		'--repo',
		repository,
		'--head',
		branch,
		'--state',
		'open',
		'--json',
		'url'
	]);
	const pullRequests = JSON.parse(output);
	return Array.isArray(pullRequests) && pullRequests.length > 0;
}

function remoteBranchExists(repository, branch) {
	const result = spawnSync(
		'git',
		['ls-remote', '--exit-code', '--heads', `https://github.com/${repository}.git`, branch],
		{
			env: process.env,
			stdio: 'ignore'
		}
	);

	if (result.error) {
		throw new Error(`Could not check branch ${branch}: ${result.error.message}`);
	}
	return result.status === 0;
}

function updateMonsanUiReference(directory, sha) {
	const packagePath = join(directory, 'package.json');
	const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
	if (!packageJson || typeof packageJson !== 'object' || !('dependencies' in packageJson)) {
		throw new Error(`${directory} does not declare dependencies.`);
	}

	const dependencies = packageJson.dependencies;
	if (!dependencies || typeof dependencies !== 'object' || !('monsan-ui' in dependencies)) {
		throw new Error(`${directory} does not depend on monsan-ui.`);
	}

	dependencies['monsan-ui'] = `github:${MONSAN_UI_REPOSITORY}#${sha}`;
	writeFileSync(packagePath, `${JSON.stringify(packageJson, null, '\t')}\n`);
}

export function updateMonsanUiBuildAllowance(directory, sha) {
	const workspacePath = join(directory, 'pnpm-workspace.yaml');
	const workspace = readFileSync(workspacePath, 'utf8');
	const allowanceReference = `monsan-ui@git+ssh://git@github.com/${MONSAN_UI_REPOSITORY}.git#${sha}`;
	const allowance = `${allowanceReference}: true`;
	const genericAllowance = /^(\s*)monsan-ui:\s+true\s*$/m;
	const pinnedAllowance =
		/^(\s*)(?:"?(monsan-ui@git\+ssh:\/\/git@github\.com\/lucasmonsan\/MonsanUI\.git#[0-9a-f]{40})"?):\s+true\s*$/im;

	if (genericAllowance.test(workspace)) {
		writeFileSync(workspacePath, workspace.replace(genericAllowance, `$1${allowance}`));
		return;
	}
	const pinnedMatch = workspace.match(pinnedAllowance);
	if (pinnedMatch) {
		const indentation = pinnedMatch[1];
		const previousAllowance = pinnedMatch[2];
		const replacement =
			previousAllowance === allowanceReference
				? `${indentation}${allowance}`
				: `${indentation}${previousAllowance}: false\n${indentation}${allowance}`;
		writeFileSync(workspacePath, workspace.replace(pinnedAllowance, replacement));
		return;
	}

	throw new Error(`${directory} does not allow MonsanUI build scripts.`);
}

export function denyUnapprovedMonsanUiBuilds(directory) {
	const workspacePath = join(directory, 'pnpm-workspace.yaml');
	const workspace = readFileSync(workspacePath, 'utf8');
	const lines = workspace.split('\n');
	let updated = false;
	const resolvedLines = lines.map((line) => {
		if (!line.includes('monsan-ui@git') || !line.endsWith('set this to true or false')) {
			return line;
		}

		updated = true;
		return line.replace('set this to true or false', 'false');
	});

	if (updated) {
		writeFileSync(workspacePath, resolvedLines.join('\n'));
	}

	return updated;
}

function changedFiles(directory) {
	return run('git', ['status', '--porcelain'], directory)
		.split('\n')
		.filter(Boolean)
		.map((line) => line.slice(3));
}

function assertOnlyDependencyFilesChanged(directory) {
	const allowedFiles = new Set(['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml']);
	const unexpectedFiles = changedFiles(directory).filter((file) => !allowedFiles.has(file));
	if (unexpectedFiles.length > 0) {
		throw new Error(`Unexpected consumer changes: ${unexpectedFiles.join(', ')}.`);
	}
}

function refreshConsumerLockfile(directory, environment) {
	const result = runVisibleResult('pnpm', ['install', '--lockfile-only'], directory, environment);
	if (result.status === 0) {
		return;
	}
	if (!denyUnapprovedMonsanUiBuilds(directory)) {
		throw new Error(`pnpm install exited with code ${result.status ?? 'unknown'}.`);
	}

	runVisible('pnpm', ['install', '--lockfile-only'], directory, environment);
}

function propagateToConsumer(repository, sha, rootDirectory) {
	const branch = `chore/update-monsan-ui-${sha.slice(0, 12)}`;
	if (hasOpenPullRequest(repository, branch)) {
		console.log(`${repository}: an update pull request is already open.`);
		return;
	}
	if (remoteBranchExists(repository, branch)) {
		console.log(`${repository}: branch ${branch} already exists; skipping.`);
		return;
	}

	const directory = join(rootDirectory, repository.toLowerCase());
	runVisible('git', [
		'clone',
		'--depth',
		'1',
		'--branch',
		DEFAULT_BRANCH,
		`https://github.com/${repository}.git`,
		directory
	]);

	try {
		runVisible('git', ['switch', '-c', branch], directory);
		updateMonsanUiReference(directory, sha);
		updateMonsanUiBuildAllowance(directory, sha);
		const consumerEnvironment = unprivilegedEnvironment();
		refreshConsumerLockfile(directory, consumerEnvironment);
		denyUnapprovedMonsanUiBuilds(directory);
		assertOnlyDependencyFilesChanged(directory);
		runVisible('pnpm', ['install', '--frozen-lockfile'], directory, consumerEnvironment);
		assertOnlyDependencyFilesChanged(directory);
		runVisible('git', ['diff', '--check'], directory);
		runVisible('pnpm', ['test'], directory, consumerEnvironment);
		runVisible('git', ['add', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'], directory);
		runVisible('git', ['config', 'user.name', 'monsan-suite-automation[bot]'], directory);
		runVisible(
			'git',
			['config', 'user.email', 'monsan-suite-automation[bot]@users.noreply.github.com'],
			directory
		);
		runVisible(
			'git',
			['commit', '-m', `chore: update monsan ui to ${sha.slice(0, 12)}`],
			directory
		);
		runVisible('git', ['push', '--set-upstream', 'origin', branch], directory);
		runVisible('gh', [
			'pr',
			'create',
			'--repo',
			repository,
			'--base',
			DEFAULT_BRANCH,
			'--head',
			branch,
			'--title',
			`chore: update monsan ui to ${sha.slice(0, 12)}`,
			'--body',
			`Automated dependency update for ${MONSAN_UI_REPOSITORY}@${sha}.`
		]);
		console.log(`${repository}: update pull request created.`);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
}

function main() {
	if (!process.env.GH_TOKEN) {
		throw new Error('GH_TOKEN is required to update consumer repositories.');
	}

	const sha = requireMonsanUiSha();
	runVisible('gh', ['auth', 'setup-git']);
	const rootDirectory = mkdtempSync(join(tmpdir(), 'monsan-ui-propagation-'));

	try {
		for (const consumer of CONSUMERS) {
			propagateToConsumer(`lucasmonsan/${consumer}`, sha, rootDirectory);
		}
	} finally {
		rmSync(rootDirectory, { recursive: true, force: true });
	}
}

const invokedScriptPath = process.argv[1] ? realpathSync(process.argv[1]) : undefined;
if (invokedScriptPath === fileURLToPath(import.meta.url)) {
	main();
}
