type $$ComponentProps = {
    flipped?: boolean;
    onFlip?: () => void;
    onswipe?: (direction: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right') => void;
    ondrag?: (offset: {
        x: number;
        y: number;
    }) => void;
    ondragend?: (offset: {
        x: number;
        y: number;
    }) => void;
    front: import('svelte').Snippet;
    back: import('svelte').Snippet;
    draggable?: boolean;
    height?: string;
};
declare const FlipCard: import("svelte").Component<$$ComponentProps, {}, "flipped">;
type FlipCard = ReturnType<typeof FlipCard>;
export default FlipCard;
