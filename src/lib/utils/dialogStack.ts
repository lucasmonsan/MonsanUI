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
	// Dialog history is an interaction layer, not application navigation. Listen
	// during capture and consume the entry we own so route guards never mistake a
	// close action for an attempt to leave the current screen.
	window.addEventListener(
		'popstate',
		(event) => {
			if (ignorePopstate) {
				ignorePopstate = false;
				event.stopImmediatePropagation();
				return;
			}
			if (stack.length > 0) {
				event.stopImmediatePropagation();
				const top = stack.pop();
				if (top) {
					if (top.onBackNavigation?.() === false) {
						history.pushState(
							{ ...history.state, monsanDialogId: top.id },
							'',
							window.location.href
						);
						stack.push(top);
						return;
					}
					top.popstateClosed = true;
					top.close();
				}
			}
		},
		true
	);
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
	if (index === -1) return;

	const [item] = stack.splice(index, 1);
	if (!item || item.popstateClosed) return;

	// A dialog can only consume the history entry it owns when it is the top
	// surface. Closing a parent while a child is mounted must never navigate
	// away from that child (or from the page behind it).
	if (index !== stack.length) return;
	ignorePopstate = true;
	history.back();
}
