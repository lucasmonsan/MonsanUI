import { slide } from 'svelte/transition';
/**
 * Transição customizada que combina Slide e Fade.
 */
export function slideFade(node, params) {
    const slideTrans = slide(node, params);
    return {
        delay: slideTrans.delay,
        duration: slideTrans.duration,
        easing: slideTrans.easing,
        css: (t, u) => `
			${slideTrans.css ? slideTrans.css(t, u) : ''}
			opacity: ${t};
		`
    };
}
