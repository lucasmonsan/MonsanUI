import type { Snippet } from 'svelte';
interface Props {
    children?: Snippet;
    onclick?: (e: MouseEvent) => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral';
    size?: 'sm' | 'md';
    shape?: 'default' | 'pill';
    disabled?: boolean;
    block?: boolean;
    square?: boolean;
    title?: string;
    'aria-label'?: string;
    [key: string]: unknown;
}
declare const Button: import("svelte").Component<Props, {}, "">;
type Button = ReturnType<typeof Button>;
export default Button;
