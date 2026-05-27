type DialogInstance = {
	id: string;
	close: () => void;
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
				top.popstateClosed = true;
				top.close();
			}
		}
	});
}

export function pushDialog(id: string, closeFn: () => void) {
	if (typeof window === 'undefined') return;
	// Push a dummy state to history to enable the back button swipe/click gesture
	history.pushState({ monsanDialogId: id }, '');
	stack.push({ id, close: closeFn });
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
