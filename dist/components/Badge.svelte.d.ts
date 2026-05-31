type $$ComponentProps = {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'due' | 'new' | 'warning';
    noShrink?: boolean;
    children?: import('svelte').Snippet;
};
declare const Badge: import("svelte").Component<$$ComponentProps, {}, "">;
type Badge = ReturnType<typeof Badge>;
export default Badge;
