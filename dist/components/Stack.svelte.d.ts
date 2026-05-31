import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'stretch' | 'start' | 'center' | 'end';
    justify?: 'start' | 'center' | 'between';
    textAlign?: 'start' | 'center';
    fullWidth?: boolean;
}
declare const Stack: import("svelte").Component<Props, {}, "">;
type Stack = ReturnType<typeof Stack>;
export default Stack;
