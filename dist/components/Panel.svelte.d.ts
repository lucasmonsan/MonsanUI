import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    /** Semantic HTML tag to render. Defaults to 'div' */
    tag?: 'div' | 'section' | 'article' | 'aside' | 'main';
    /** Enables hover and click neubrutalist micro-interactions */
    interactive?: boolean;
    /** Customizable inner padding. Defaults to 'var(--space-lg)' */
    padding?: string;
    /** Max width of the panel. Defaults to '512px' */
    maxWidth?: string;
    /** Expand to fill parent height */
    fullHeight?: boolean;
    /** Neubrutalist color theme variant. Defaults to 'primary' */
    variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral';
    /** Optional overflow handling for content that can exceed the panel width. */
    overflow?: 'visible' | 'x' | 'hidden';
    /** Click event handler */
    onclick?: (event: MouseEvent) => void;
    /** Keydown event handler */
    onkeydown?: (event: KeyboardEvent) => void;
}
declare const Panel: import("svelte").Component<Props, {}, "">;
type Panel = ReturnType<typeof Panel>;
export default Panel;
