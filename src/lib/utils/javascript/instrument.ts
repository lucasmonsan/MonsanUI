import { javascriptLanguage } from '@codemirror/lang-javascript';
import { findJsSyntaxError } from './diagnostics.js';

/**
 * Returns line number (1-indexed) for a character offset in the source string.
 */
function getLineNumber(source: string, pos: number): number {
	return source.slice(0, pos).split('\n').length;
}

interface Insertion {
	from: number;
	to?: number;
	text: string;
}

/**
 * Instruments JavaScript code with `await __crocode_step(line, { ...inScopeVars })` calls
 * before each statement and rewrites `prompt()` calls into `await __crocode_prompt()`.
 *
 * Line numbers in the original source are 100% preserved because insertions do not
 * introduce newlines before existing code.
 */
export function instrumentJsCode(code: string): string {
	if (!code || !code.trim()) return code;

	// If code has syntax errors, do not instrument to avoid creating confusing secondary errors
	if (findJsSyntaxError(code)) {
		return code;
	}

	try {
		const tree = javascriptLanguage.parser.parse(code);

		// If top-level node has syntax errors that prevent statement analysis, return original
		const top = tree.topNode;
		if (top.name !== 'Script') {
			return code;
		}

		const insertions: Insertion[] = [];

		// 1. Transform prompt(...) and window.prompt(...) calls into await __crocode_prompt(...)
		const cursor = tree.cursor();
		do {
			if (cursor.name === 'CallExpression') {
				const sub = cursor.node.firstChild;
				const isPrompt =
					sub &&
					((sub.name === 'VariableName' && code.slice(sub.from, sub.to) === 'prompt') ||
						(sub.name === 'MemberExpression' && code.slice(sub.from, sub.to) === 'window.prompt'));
				if (isPrompt) {
					insertions.push({ from: cursor.from, to: sub.to, text: 'await __crocode_prompt' });
				}
			}
		} while (cursor.next());

		// 2. Statement-level step instrumentation and scope tracking
		interface AstNode {
			name: string;
			from: number;
			to: number;
			firstChild: AstNode | null;
			nextSibling: AstNode | null;
		}

		function getInScopeVars(scopeStack: Set<string>[]): string[] {
			return Array.from(new Set(scopeStack.flatMap((s) => Array.from(s))));
		}

		function visitBlockOrStatement(
			node: AstNode,
			scopeStack: Set<string>[],
			isSingleBody = false
		): void {
			const allVars = getInScopeVars(scopeStack);
			const line = getLineNumber(code, node.from);

			if (node.name === 'Block') {
				let child = node.firstChild;
				while (child) {
					if (child.name !== '{' && child.name !== '}') {
						visitStatement(child, scopeStack);
					}
					child = child.nextSibling;
				}
				return;
			}

			if (isSingleBody) {
				insertions.push({
					from: node.from,
					text: `{ /*__s__*/await __crocode_step(${line}, {${allVars.join(',')}}); `
				});
				insertions.push({ from: node.to, text: ' }' });
				return;
			}

			visitStatement(node, scopeStack);
		}

		function visitStatement(child: AstNode, scopeStack: Set<string>[]): void {
			const currentScope = scopeStack[scopeStack.length - 1];
			const allVars = getInScopeVars(scopeStack);
			const line = getLineNumber(code, child.from);

			switch (child.name) {
				case 'VariableDeclaration': {
					insertions.push({
						from: child.from,
						text: `/*__s__*/await __crocode_step(${line}, {${allVars.join(',')}}); `
					});
					// Extract defined names and add them to scope after this statement
					let sub = child.firstChild;
					while (sub) {
						if (sub.name === 'VariableDefinition') {
							currentScope.add(code.slice(sub.from, sub.to));
						}
						sub = sub.nextSibling;
					}
					break;
				}

				case 'ExpressionStatement':
				case 'ReturnStatement':
				case 'ThrowStatement':
				case 'BreakStatement':
				case 'ContinueStatement': {
					insertions.push({
						from: child.from,
						text: `/*__s__*/await __crocode_step(${line}, {${allVars.join(',')}}); `
					});
					break;
				}

				case 'IfStatement': {
					insertions.push({
						from: child.from,
						text: `/*__s__*/await __crocode_step(${line}, {${allVars.join(',')}}); `
					});
					let sub = child.firstChild;
					let pastCond = false;
					while (sub) {
						if (sub.name === 'ParenthesizedExpression') {
							pastCond = true;
						} else if (pastCond && sub.name !== 'else') {
							if (sub.name === 'IfStatement') {
								// else if
								visitStatement(sub, scopeStack);
							} else if (sub.name === 'Block') {
								visitBlockOrStatement(sub, [...scopeStack, new Set()]);
							} else {
								visitBlockOrStatement(sub, [...scopeStack, new Set()], true);
							}
						}
						sub = sub.nextSibling;
					}
					break;
				}

				case 'WhileStatement':
				case 'DoWhileStatement': {
					insertions.push({
						from: child.from,
						text: `/*__s__*/await __crocode_step(${line}, {${allVars.join(',')}}); `
					});
					let sub = child.firstChild;
					while (sub) {
						if (sub.name === 'Block') {
							visitBlockOrStatement(sub, [...scopeStack, new Set()]);
						} else if (
							sub.name !== 'while' &&
							sub.name !== 'do' &&
							sub.name !== 'ParenthesizedExpression' &&
							sub.name !== ';'
						) {
							visitBlockOrStatement(sub, [...scopeStack, new Set()], true);
						}
						sub = sub.nextSibling;
					}
					break;
				}

				case 'ForStatement': {
					insertions.push({
						from: child.from,
						text: `/*__s__*/await __crocode_step(${line}, {${allVars.join(',')}}); `
					});
					const forScope = new Set<string>();
					let sub = child.firstChild;
					while (sub) {
						if (sub.name === 'ForSpec') {
							let fchild = sub.firstChild;
							while (fchild) {
								if (fchild.name === 'VariableDeclaration') {
									let vdef = fchild.firstChild;
									while (vdef) {
										if (vdef.name === 'VariableDefinition') {
											forScope.add(code.slice(vdef.from, vdef.to));
										}
										vdef = vdef.nextSibling;
									}
								}
								fchild = fchild.nextSibling;
							}
						} else if (sub.name === 'Block') {
							visitBlockOrStatement(sub, [...scopeStack, forScope]);
						} else if (sub.name !== 'for' && sub.name !== 'ForSpec' && sub.name !== ';') {
							visitBlockOrStatement(sub, [...scopeStack, forScope], true);
						}
						sub = sub.nextSibling;
					}
					break;
				}

				case 'SwitchStatement': {
					insertions.push({
						from: child.from,
						text: `/*__s__*/await __crocode_step(${line}, {${allVars.join(',')}}); `
					});
					let sub = child.firstChild;
					while (sub) {
						if (sub.name === 'SwitchBlock') {
							let clause = sub.firstChild;
							const switchScope = new Set<string>();
							while (clause) {
								if (clause.name === 'CaseClause' || clause.name === 'DefaultClause') {
									let cstmt = clause.firstChild;
									let pastColon = false;
									while (cstmt) {
										if (cstmt.name === ':') {
											pastColon = true;
										} else if (pastColon) {
											visitStatement(cstmt, [...scopeStack, switchScope]);
										}
										cstmt = cstmt.nextSibling;
									}
								}
								clause = clause.nextSibling;
							}
						}
						sub = sub.nextSibling;
					}
					break;
				}

				case 'FunctionDeclaration': {
					// Add function name to outer scope
					let sub = child.firstChild;
					while (sub) {
						if (sub.name === 'VariableDefinition') {
							currentScope.add(code.slice(sub.from, sub.to));
						}
						sub = sub.nextSibling;
					}
					break;
				}
			}
		}

		const rootScope = [new Set<string>()];
		let child = top.firstChild as unknown as AstNode | null;
		while (child) {
			visitStatement(child, rootScope);
			child = child.nextSibling;
		}

		// Sort insertions in reverse order to apply from end to start without affecting offsets
		insertions.sort((a, b) => b.from - a.from || (b.to ?? b.from) - (a.to ?? a.from));

		let result = code;
		for (const ins of insertions) {
			const to = ins.to ?? ins.from;
			result = result.slice(0, ins.from) + ins.text + result.slice(to);
		}

		// Final step at the end with all declared variables
		const finalVars = getInScopeVars(rootScope);
		result += `\n/*__s__*/await __crocode_step(0, {${finalVars.join(',')}});`;

		return result;
	} catch {
		return code;
	}
}
