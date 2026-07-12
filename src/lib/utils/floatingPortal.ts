type FloatingPortalAlign = 'left' | 'right';

type FloatingPortalOptions = {
	anchor?: HTMLElement;
	align?: FloatingPortalAlign;
	matchWidth?: boolean;
	minWidth?: number;
	offset?: number;
	zIndex?: number;
};

const viewportPadding = 8;

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function floatingPortal(node: HTMLElement, options: FloatingPortalOptions = {}) {
	let activeOptions = options;
	let frame: number | undefined;
	let marker: Comment | undefined;
	let resizeObserver: ResizeObserver | undefined;

	function schedulePositionUpdate() {
		if (frame !== undefined) cancelAnimationFrame(frame);
		frame = requestAnimationFrame(updatePosition);
	}

	function updatePosition() {
		frame = undefined;
		const anchor = activeOptions.anchor;
		if (!anchor) return;

		const anchorRect = anchor.getBoundingClientRect();
		const offset = activeOptions.offset ?? 4;
		const minWidth = activeOptions.minWidth ?? 0;
		const matchWidth = activeOptions.matchWidth ?? false;
		const preferredWidth = matchWidth
			? anchorRect.width
			: Math.max(node.offsetWidth, anchorRect.width, minWidth);
		const width = Math.min(preferredWidth, window.innerWidth - viewportPadding * 2);
		const alignedLeft =
			activeOptions.align === 'right' ? anchorRect.right - width : anchorRect.left;
		const left = clamp(alignedLeft, viewportPadding, window.innerWidth - width - viewportPadding);
		const belowTop = anchorRect.bottom + offset;
		const aboveTop = anchorRect.top - node.offsetHeight - offset;
		const hasBelowSpace = belowTop + node.offsetHeight <= window.innerHeight - viewportPadding;
		const top = hasBelowSpace ? belowTop : Math.max(viewportPadding, aboveTop);

		node.style.position = 'fixed';
		node.style.left = `${left}px`;
		node.style.top = `${top}px`;
		node.style.width = `${width}px`;
		node.style.zIndex = String(activeOptions.zIndex ?? 1002);
	}

	function mount() {
		if (!document.body.contains(node)) {
			marker = document.createComment('monsan-floating-portal');
			node.parentNode?.insertBefore(marker, node);
			document.body.appendChild(node);
		}

		node.style.visibility = 'hidden';
		updatePosition();
		node.style.visibility = '';

		window.addEventListener('resize', schedulePositionUpdate);
		window.addEventListener('scroll', schedulePositionUpdate, true);

		resizeObserver = new ResizeObserver(schedulePositionUpdate);
		if (activeOptions.anchor) resizeObserver.observe(activeOptions.anchor);
		resizeObserver.observe(node);
	}

	mount();

	return {
		update(nextOptions: FloatingPortalOptions = {}) {
			activeOptions = nextOptions;
			schedulePositionUpdate();
		},
		destroy() {
			if (frame !== undefined) cancelAnimationFrame(frame);
			window.removeEventListener('resize', schedulePositionUpdate);
			window.removeEventListener('scroll', schedulePositionUpdate, true);
			resizeObserver?.disconnect();
			node.remove();
			marker?.remove();
		}
	};
}
