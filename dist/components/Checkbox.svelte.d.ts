import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'size' | 'checked'> {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    size?: 'sm' | 'md';
    class?: string;
}
declare const Checkbox: import("svelte").Component<Props, {}, "checked">;
type Checkbox = ReturnType<typeof Checkbox>;
export default Checkbox;
