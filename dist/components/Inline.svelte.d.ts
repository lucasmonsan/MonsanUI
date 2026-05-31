import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    gap?: 'xs' | 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end';
    justify?: 'start' | 'center' | 'between' | 'end';
    wrap?: boolean;
    fullWidth?: boolean;
}
declare const Inline: import("svelte").Component<Props, {}, "">;
type Inline = ReturnType<typeof Inline>;
export default Inline;
