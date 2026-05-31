import { type SlideParams } from 'svelte/transition';
/**
 * Transição customizada que combina Slide e Fade.
 */
export declare function slideFade(node: HTMLElement, params: SlideParams): {
    delay: number | undefined;
    duration: number | undefined;
    easing: import("svelte/transition").EasingFunction | undefined;
    css: (t: number, u: number) => string;
};
