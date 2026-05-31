type $$ComponentProps = {
    open?: boolean;
    variant?: 'dropdown' | 'reveal';
    align?: 'left' | 'right';
    width?: string;
    class?: string;
    triggerLabel?: string;
    trigger?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
};
declare const QuickActions: import("svelte").Component<$$ComponentProps, {}, "open">;
type QuickActions = ReturnType<typeof QuickActions>;
export default QuickActions;
