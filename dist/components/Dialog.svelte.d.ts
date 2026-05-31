type $$ComponentProps = {
    open: boolean;
    title: string;
    children: import('svelte').Snippet;
    onClose?: () => void;
    headerActions?: import('svelte').Snippet;
    closeLabel?: string;
    closeOnBackNavigation?: boolean;
    size?: 'sm' | 'md' | 'lg';
    animation?: 'pop' | 'slide' | 'fade' | 'scale';
    padding?: string;
};
declare const Dialog: import("svelte").Component<$$ComponentProps, {}, "open">;
type Dialog = ReturnType<typeof Dialog>;
export default Dialog;
