import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'size' | 'value'> {
    value?: string | number | null;
    size?: 'sm' | 'md';
    variant?: 'default' | 'unstyled' | 'title';
    showPasswordToggle?: boolean;
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
}
declare const Input: import("svelte").Component<Props, {
    focus: () => void;
}, "value">;
type Input = ReturnType<typeof Input>;
export default Input;
