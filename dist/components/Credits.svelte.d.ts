type $$ComponentProps = {
    authorName?: string;
    svelteVersion?: string;
    customText?: string;
    authorLink?: string;
    class?: string;
    madeWithText?: string;
    createdWithText?: string;
    copyright?: string;
    placement?: 'inline' | 'page-bottom';
    variant?: 'default' | 'compact';
};
declare const Credits: import("svelte").Component<$$ComponentProps, {}, "">;
type Credits = ReturnType<typeof Credits>;
export default Credits;
