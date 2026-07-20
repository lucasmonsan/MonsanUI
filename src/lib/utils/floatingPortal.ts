type FloatingPortalAlign = 'left' | 'right' | 'auto';
type FloatingPortalPlacement = 'top' | 'bottom' | 'auto';

type FloatingPortalOptions = {
	anchor?: HTMLElement;
	align?: FloatingPortalAlign;
	placement?: FloatingPortalPlacement;
	matchWidth?: boolean;
	minWidth?: number;
	maxWidth?: number;
	offset?: number;
	zIndex?: number;
};

const viewportPadding = 8;
const geometryTolerance = 0.5;
const requiredStableFrames = 2;
const maximumSettleFrames = 24;

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function floatingPortal(node: HTMLElement, options: FloatingPortalOptions = {}) {
	let activeOptions = options;
	let frame: number | undefined;
	let marker: Comment | undefined;
	let resizeObserver: ResizeObserver | undefined;
	let positioned = false;
	let settleFrames = 0;
	let stableFrames = 0;
	let previousAnchorRect: DOMRect | undefined;

	function ensurePortalRoot() {
		const portalRoot = activeOptions.anchor?.closest('dialog') ?? document.body;
		if (node.parentNode === portalRoot) return;
		if (!marker) {
			marker = document.createComment('monsan-floating-portal');
			node.parentNode?.insertBefore(marker, node);
		}
		portalRoot.appendChild(node);
	}

	function schedulePositionUpdate() {
		if (frame !== undefined) cancelAnimationFrame(frame);
		if (!positioned) {
			settleFrames = 0;
			stableFrames = 0;
			previousAnchorRect = undefined;
			frame = requestAnimationFrame(settleAndReveal);
			return;
		}
		frame = requestAnimationFrame(positionAndReveal);
	}

	function rectIsStable(current: DOMRect, previous: DOMRect) {
		return (
			Math.abs(current.left - previous.left) <= geometryTolerance &&
			Math.abs(current.top - previous.top) <= geometryTolerance &&
			Math.abs(current.width - previous.width) <= geometryTolerance &&
			Math.abs(current.height - previous.height) <= geometryTolerance
		);
	}

	function settleAndReveal() {
		frame = undefined;
		const anchor = activeOptions.anchor;
		if (!anchor) return;

		ensurePortalRoot();
		const anchorRect = anchor.getBoundingClientRect();
		settleFrames += 1;
		stableFrames =
			previousAnchorRect && rectIsStable(anchorRect, previousAnchorRect) ? stableFrames + 1 : 0;
		previousAnchorRect = anchorRect;

		if (stableFrames >= requiredStableFrames || settleFrames >= maximumSettleFrames) {
			positioned = true;
			positionAndReveal();
			return;
		}

		frame = requestAnimationFrame(settleAndReveal);
	}

	function positionAndReveal() {
		frame = undefined;
		const anchor = activeOptions.anchor;
		if (!anchor) return;
		ensurePortalRoot();

		const anchorRect = anchor.getBoundingClientRect();
		const visualViewport = window.visualViewport;
		const viewportLeft = visualViewport?.offsetLeft ?? 0;
		const viewportTop = visualViewport?.offsetTop ?? 0;
		const viewportWidth = visualViewport?.width ?? window.innerWidth;
		const viewportHeight = visualViewport?.height ?? window.innerHeight;
		const minLeft = viewportLeft + viewportPadding;
		const maxRight = viewportLeft + viewportWidth - viewportPadding;
		const minTop = viewportTop + viewportPadding;
		const maxBottom = viewportTop + viewportHeight - viewportPadding;
		const availableWidth = Math.max(0, maxRight - minLeft);
		const offset = activeOptions.offset ?? 4;
		const minWidth = Math.min(activeOptions.minWidth ?? 0, availableWidth);
		const maxWidth = Math.max(
			minWidth,
			Math.min(activeOptions.maxWidth ?? availableWidth, availableWidth)
		);
		const matchWidth = activeOptions.matchWidth ?? false;

		node.style.minWidth = `${minWidth}px`;
		node.style.maxWidth = `${maxWidth}px`;
		node.style.width = matchWidth ? `${Math.max(anchorRect.width, minWidth)}px` : 'max-content';
		const naturalWidth = node.getBoundingClientRect().width;
		const preferredWidth = matchWidth
			? Math.max(anchorRect.width, minWidth)
			: Math.max(naturalWidth, anchorRect.width, minWidth);
		const width = Math.min(preferredWidth, maxWidth);
		const align =
			activeOptions.align && activeOptions.align !== 'auto'
				? activeOptions.align
				: anchorRect.left + anchorRect.width / 2 > viewportLeft + viewportWidth / 2
					? 'right'
					: 'left';
		const alignedLeft = align === 'right' ? anchorRect.right - width : anchorRect.left;
		const left = clamp(alignedLeft, minLeft, maxRight - width);

		node.style.width = `${width}px`;
		const height = node.getBoundingClientRect().height;
		const belowTop = anchorRect.bottom + offset;
		const aboveTop = anchorRect.top - height - offset;
		const hasBelowSpace = belowTop + height <= maxBottom;
		const hasAboveSpace = aboveTop >= minTop;
		const placement = activeOptions.placement ?? 'auto';
		const useTop =
			placement === 'top'
				? hasAboveSpace || !hasBelowSpace
				: placement === 'bottom'
					? !hasBelowSpace && hasAboveSpace
					: !hasBelowSpace && hasAboveSpace;
		const desiredTop = useTop ? aboveTop : belowTop;
		const top = clamp(desiredTop, minTop, Math.max(minTop, maxBottom - height));

		node.style.position = 'fixed';
		node.style.left = `${left}px`;
		node.style.top = `${top}px`;
		node.style.width = `${width}px`;
		node.style.zIndex = String(activeOptions.zIndex ?? 1002);
		node.dataset.floatingPositioned = 'true';
		node.style.visibility = 'visible';
	}

	function mount() {
		node.style.visibility = 'hidden';
		node.dataset.floatingPositioned = 'false';
		ensurePortalRoot();
		schedulePositionUpdate();

		window.addEventListener('resize', schedulePositionUpdate);
		window.addEventListener('scroll', schedulePositionUpdate, true);
		window.visualViewport?.addEventListener('resize', schedulePositionUpdate);
		window.visualViewport?.addEventListener('scroll', schedulePositionUpdate);

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
			window.visualViewport?.removeEventListener('resize', schedulePositionUpdate);
			window.visualViewport?.removeEventListener('scroll', schedulePositionUpdate);
			resizeObserver?.disconnect();
			node.remove();
			marker?.remove();
		}
	};
}
