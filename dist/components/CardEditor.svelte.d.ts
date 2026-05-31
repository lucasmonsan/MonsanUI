interface Field {
    id: string;
    label: string;
    placeholder?: string;
    type: 'text' | 'textarea';
    rows?: number;
    optional?: boolean;
}
interface Props {
    value: Record<string, unknown>;
    index: number;
    totalCards: number;
    onMove: (index: number, direction: -1 | 1) => void;
    onDuplicate: (index: number) => void;
    onRemove: (index: number) => void;
    isDragging?: boolean;
    onDragStart?: (index: number) => void;
    onDragOver?: (event: DragEvent, index: number) => void;
    onDragEnd?: () => void;
    dragDisabled?: boolean;
    fields?: Field[];
    labels?: {
        cardNumber?: (n: number) => string;
        moveUp?: string;
        moveDown?: string;
        duplicateCard?: string;
        deleteCard?: string;
        addOptionalField?: (label: string) => string;
        removeOptionalField?: (label: string) => string;
    };
}
declare const CardEditor: import("svelte").Component<Props, {}, "value">;
type CardEditor = ReturnType<typeof CardEditor>;
export default CardEditor;
