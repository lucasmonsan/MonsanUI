interface Props {
    options: string[];
    value?: string[];
    disabled?: boolean;
    columns?: number;
    formatIndex?: (index: number) => string;
    showNumbers?: boolean;
}
declare const DndOrder: import("svelte").Component<Props, {}, "value">;
type DndOrder = ReturnType<typeof DndOrder>;
export default DndOrder;
