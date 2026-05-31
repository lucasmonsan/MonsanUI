import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
    value?: string[];
    placeholder?: string;
    disabled?: boolean;
    class?: string;
}
declare const Chips: import("svelte").Component<Props, {}, "value">;
type Chips = ReturnType<typeof Chips>;
export default Chips;
