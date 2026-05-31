import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'value' | 'type'> {
    value?: Date | null;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
}
declare const DatePicker: import("svelte").Component<Props, {}, "value">;
type DatePicker = ReturnType<typeof DatePicker>;
export default DatePicker;
