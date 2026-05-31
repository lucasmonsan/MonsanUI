import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    direction?: 'row' | 'column';
}
declare const ButtonGroup: import("svelte").Component<Props, {}, "">;
type ButtonGroup = ReturnType<typeof ButtonGroup>;
export default ButtonGroup;
