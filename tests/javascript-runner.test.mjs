import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	JavaScriptRunnerSession,
	formatJsExecutionError
} from '../src/lib/utils/javascript/runner.ts';

test('JavaScriptRunnerSession runs synchronous code and captures console.log', async () => {
	const session = new JavaScriptRunnerSession();
	const result = await session.run(`
		const a = 10;
		const b = 20;
		console.log('Soma:', a + b);
	`);

	assert.equal(result.error, null);
	assert.ok(result.outputs.includes('Soma: 30'));
});

test('JavaScriptRunnerSession handles async code and returns values', async () => {
	const session = new JavaScriptRunnerSession();
	const result = await session.run(`
		const promise = Promise.resolve(42);
		const val = await promise;
		console.log('Valor:', val);
	`);

	assert.equal(result.error, null);
	assert.ok(result.outputs.includes('Valor: 42'));
});

test('JavaScriptRunnerSession captures errors and formats line number', async () => {
	const session = new JavaScriptRunnerSession();
	const result = await session.run(`
		const x = 1;
		throw new Error('Falha proposital');
	`);

	assert.notEqual(result.error, null);
	assert.ok(result.error.message.includes('Falha proposital'));
});

test('JavaScriptRunnerSession captures console.warn and console.error with prefixes', async () => {
	const session = new JavaScriptRunnerSession();
	const result = await session.run(`
		console.warn('Atenção aqui');
		console.error('Erro crítico');
	`);

	assert.equal(result.error, null);
	assert.ok(result.outputs.some((o) => o.includes('[AVISO] Atenção aqui')));
	assert.ok(result.outputs.some((o) => o.includes('[ERRO] Erro crítico')));
});

test('JavaScriptRunnerSession stops execution', async () => {
	const session = new JavaScriptRunnerSession();
	const promise = session.run(`
		await new Promise(r => setTimeout(r, 1000));
		console.log('Depois do delay');
	`);
	session.stop();
	const result = await promise;
	assert.ok(!result.outputs.includes('Depois do delay'));
});

test('formatJsExecutionError formats error messages cleanly', () => {
	const err = new Error('Syntax error test');
	const formatted = formatJsExecutionError(err, 'const a = 1;');
	assert.ok(formatted.message.includes('Syntax error test'));
});

test('buildWorkerScript inlines user code without new Function or eval', async () => {
	const { buildWorkerScript } = await import('../src/lib/utils/javascript/runner.ts');
	const userCode = 'console.log("hello world!");';
	const { script, headerLineCount } = buildWorkerScript(userCode, 1);

	assert.ok(script.includes(userCode));
	assert.ok(!script.includes('AsyncFunction'));
	assert.ok(!script.includes('new Function'));
	assert.ok(!script.includes('eval('));
	assert.ok(headerLineCount > 0);
});
