import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    columns?: 'one' | 'two' | 'three';
    gap?: 'sm' | 'md' | 'lg';
    responsive?: boolean;
}
declare const Grid: import("svelte").Component<Props, {}, "">;
type Grid = ReturnType<typeof Grid>;
export default Grid;
