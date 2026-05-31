interface Props {
    deck: {
        id: string;
        name: string;
        cards?: import('../types.js').Card[];
    };
    index: number;
    folderColor?: string;
    isPopoverOpen?: boolean;
    isMenuOpen?: boolean;
    stats?: {
        newCount: number;
        dueCount: number;
    };
    modes?: Array<{
        id: string;
        label: string;
        iconPath?: string;
    }>;
    labels?: {
        cards?: string;
        due?: string;
        new?: string;
        duplicate?: string;
        edit?: string;
        delete?: string;
    };
    onSelect?: () => void;
    onContextMenu?: (e: MouseEvent) => void;
    onOpenMenu?: () => void;
    onDuplicate?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onStartSession?: (mode: string) => void;
    badges?: import('svelte').Snippet;
    actions?: import('svelte').Snippet;
    popover?: import('svelte').Snippet;
}
declare const Deck: import("svelte").Component<Props, {}, "isPopoverOpen" | "isMenuOpen">;
type Deck = ReturnType<typeof Deck>;
export default Deck;
