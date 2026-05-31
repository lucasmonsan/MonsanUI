import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    label: string;
    title?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'error';
    selected?: boolean;
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
}
declare const IconButton: import("svelte").Component<Props, {}, "">;
type IconButton = ReturnType<typeof IconButton>;
export default IconButton;
