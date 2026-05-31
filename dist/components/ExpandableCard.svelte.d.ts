type $$ComponentProps = {
    expanded?: boolean;
    title?: string;
    header?: import('svelte').Snippet;
    children: import('svelte').Snippet;
    showIndicator?: boolean;
    indicatorText?: string;
    indicatorTextExpanded?: string;
    showChevron?: boolean;
    showText?: boolean;
    expandOn?: 'card' | 'header' | 'indicator';
    compact?: boolean;
};
declare const ExpandableCard: import("svelte").Component<$$ComponentProps, {}, "expanded">;
type ExpandableCard = ReturnType<typeof ExpandableCard>;
export default ExpandableCard;
