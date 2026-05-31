interface DndMatchLabels {
    poolTitle?: string;
    allClassified?: string;
    dropHere?: string;
}
interface Props {
    options: string[];
    buckets: string[];
    value?: Record<string, string[]>;
    disabled?: boolean;
    labels?: DndMatchLabels;
}
declare const DndMatch: import("svelte").Component<Props, {}, "value">;
type DndMatch = ReturnType<typeof DndMatch>;
export default DndMatch;
