import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    class?: string;
}
declare const Range: import("svelte").Component<Props, {}, "value">;
type Range = ReturnType<typeof Range>;
export default Range;
