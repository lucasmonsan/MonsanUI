type DialogInstance = {
	id: string;
	close: () => void;
	/**
	 * Returns true when the Back gesture should close the dialog. Returning false
	 * keeps the dialog open and restores its history entry (for example, after
	 * dismissing a virtual keyboard).
	 */
	onBackNavigation?: () => boolean;
	popstateClosed?: boolean;
};

const stack: DialogInstance[] = [];
let ignorePopstate = false;

if (typeof window !== 'undefined') {
	window.addEventListener('popstate', () => {
		if (ignorePopstate) {
			ignorePopstate = false;
			return;
		}
		if (stack.length > 0) {
			const top = stack.pop();
			if (top) {
				if (top.onBackNavigation?.() === false) {
					history.pushState({ ...history.state, monsanDialogId: top.id }, '', window.location.href);
					stack.push(top);
					return;
				}
				top.popstateClosed = true;
				top.close();
			}
		}
	});
}

export function pushDialog(id: string, closeFn: () => void, onBackNavigation?: () => boolean) {
	if (typeof window === 'undefined') return;
	// Keep the current URL and SvelteKit state intact while adding one history
	// entry. A Back gesture can then close the dialog before leaving the page.
	history.pushState({ ...history.state, monsanDialogId: id }, '', window.location.href);
	stack.push({ id, close: closeFn, onBackNavigation });
}

export function popDialog(id: string) {
	if (typeof window === 'undefined') return;
	const index = stack.findIndex((item) => item.id === id);
	if (index !== -1) {
		const item = stack[index];
		stack.splice(index, 1);
		if (!item.popstateClosed) {
			ignorePopstate = true;
			history.back();
		}
	}
}
