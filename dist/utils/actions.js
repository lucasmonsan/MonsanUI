/**
 * Action para auto-redimensionar textarea baseado no conteúdo.
 */
export function autoResizeAction(node) {
    let prevWidth = 0;
    let prevHeight = 0;
    function resize() {
        if (node.clientWidth === 0) {
            return;
        }
        node.style.height = 'auto';
        const scrollHeight = node.scrollHeight;
        if (scrollHeight > 0) {
            const style = window.getComputedStyle(node);
            const boxSizing = style.boxSizing;
            if (boxSizing === 'border-box') {
                const borderTop = parseFloat(style.borderTopWidth) || 0;
                const borderBottom = parseFloat(style.borderBottomWidth) || 0;
                node.style.height = scrollHeight + borderTop + borderBottom + 'px';
            }
            else {
                node.style.height = scrollHeight + 'px';
            }
        }
    }
    node.addEventListener('input', resize);
    node.addEventListener('focus', resize);
    // Run initially in requestAnimationFrame to ensure style/layout is complete
    const rafId = requestAnimationFrame(() => {
        resize();
    });
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                const wentVisible = (width > 0 && prevWidth === 0) || (height > 0 && prevHeight === 0);
                const widthChanged = width > 0 && width !== prevWidth;
                if (wentVisible || widthChanged) {
                    prevWidth = width;
                    prevHeight = height;
                    resize();
                }
                else if (width === 0 && height === 0) {
                    prevWidth = 0;
                    prevHeight = 0;
                }
            }
        });
        resizeObserver.observe(node);
    }
    return {
        update() {
            // Run update in requestAnimationFrame to ensure Svelte has finished updating the DOM
            requestAnimationFrame(() => {
                resize();
            });
        },
        destroy() {
            node.removeEventListener('input', resize);
            node.removeEventListener('focus', resize);
            cancelAnimationFrame(rafId);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        }
    };
}
