import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	javascriptReferenceItems,
	getJavaScriptReferenceItem,
	getSupportedJavaScriptReferenceNames
} from '../dist/utils/javascript/reference.js';
import { tokenizeJsCode } from '../dist/utils/portugol/highlight.js';

test('javascriptReferenceItems contains valid syntax and descriptions for all items', () => {
	assert.ok(javascriptReferenceItems.length >= 25);
	for (const item of javascriptReferenceItems) {
		assert.ok(item.name.length > 0, 'Item must have a name');
		assert.ok(item.syntax.length > 0, `Item ${item.name} must have syntax`);
		assert.ok(item.description.length > 0, `Item ${item.name} must have description`);
		assert.ok(item.category.length > 0, `Item ${item.name} must have category`);
		assert.equal(item.status, 'supported');
	}
});

test('getJavaScriptReferenceItem finds items by name and aliases case-insensitively', () => {
	const promptItem = getJavaScriptReferenceItem('prompt');
	assert.ok(promptItem);
	assert.equal(promptItem.name, 'prompt');
	assert.equal(promptItem.category, 'input-output');

	const promptAlias = getJavaScriptReferenceItem('prompt()');
	assert.ok(promptAlias);
	assert.equal(promptAlias.name, 'prompt');

	const floorItem = getJavaScriptReferenceItem('MATH.FLOOR');
	assert.ok(floorItem);
	assert.equal(floorItem.name, 'Math.floor');
	assert.equal(floorItem.category, 'math');

	const floorAlias = getJavaScriptReferenceItem('divisão inteira');
	assert.ok(floorAlias);
	assert.equal(floorAlias.name, 'Math.floor');

	const missing = getJavaScriptReferenceItem('item-que-nao-existe');
	assert.equal(missing, undefined);

	const assignItem = getJavaScriptReferenceItem('=');
	assert.ok(assignItem);
	assert.equal(assignItem.name, '=');
	assert.equal(assignItem.category, 'operator');

	const assignAlias = getJavaScriptReferenceItem('<-');
	assert.ok(assignAlias);
	assert.equal(assignAlias.name, '=');

	const plusAssign = getJavaScriptReferenceItem('+=');
	assert.ok(plusAssign);
	assert.equal(plusAssign.name, '+=');
});

test('getSupportedJavaScriptReferenceNames returns comprehensive list', () => {
	const names = getSupportedJavaScriptReferenceNames();
	assert.ok(names.includes('const'));
	assert.ok(names.includes('let'));
	assert.ok(names.includes('='));
	assert.ok(names.includes('+='));
	assert.ok(names.includes('-='));
	assert.ok(names.includes('prompt'));
	assert.ok(names.includes('console.log'));
	assert.ok(names.includes('console.clear'));
	assert.ok(names.includes('Math.floor'));
	assert.ok(names.includes('if'));
	assert.ok(names.includes('for'));
	assert.ok(names.includes('function'));
});

test('tokenizeJsCode correctly tokenizes JavaScript keywords, strings, comments and numbers', () => {
	const code = 'const valor = 42; // resposta\nconsole.log(`Numero: ${valor}`);';
	const tokens = tokenizeJsCode(code);

	assert.ok(tokens.some((t) => t.kind === 'keyword' && t.text === 'const'));
	assert.ok(tokens.some((t) => t.kind === 'number' && t.text === '42'));
	assert.ok(tokens.some((t) => t.kind === 'comment' && t.text.includes('resposta')));
	assert.ok(tokens.some((t) => t.kind === 'keyword' && t.text === 'console'));
	assert.ok(tokens.some((t) => t.kind === 'string' && t.text.includes('Numero:')));
});
