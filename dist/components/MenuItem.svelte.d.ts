import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    onclick?: (event: MouseEvent) => void;
    variant?: 'default' | 'error';
}
declare const MenuItem: import("svelte").Component<Props, {}, "">;
type MenuItem = ReturnType<typeof MenuItem>;
export default MenuItem;
