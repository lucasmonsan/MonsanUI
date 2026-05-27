import { slide, type SlideParams } from 'svelte/transition';

/**
 * Transição customizada que combina Slide e Fade.
 */
export function slideFade(node: HTMLElement, params: SlideParams) {
	const slideTrans = slide(node, params);
	return {
		delay: slideTrans.delay,
		duration: slideTrans.duration,
		easing: slideTrans.easing,
		css: (t: number, u: number) => `
			${slideTrans.css ? slideTrans.css(t, u) : ''}
			opacity: ${t};
		`
	};
}
