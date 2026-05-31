interface Toast {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}
interface Props {
    toast: Toast;
    role?: string;
    ariaLive?: 'polite' | 'assertive' | 'off';
}
declare const Toast: import("svelte").Component<Props, {}, "">;
export default Toast;
