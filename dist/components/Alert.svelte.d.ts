import type { Snippet } from 'svelte';
interface Props {
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    dismissible?: boolean;
    ondismiss?: () => void;
    closeLabel?: string;
    focusOnMount?: boolean;
    showIcon?: boolean;
    role?: string;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
}
declare const Alert: import("svelte").Component<Props, {}, "">;
type Alert = ReturnType<typeof Alert>;
export default Alert;
