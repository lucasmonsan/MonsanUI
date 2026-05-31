import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'value' | 'type'> {
    value?: string;
    disabled?: boolean;
    class?: string;
}
declare const TimePicker: import("svelte").Component<Props, {}, "value">;
type TimePicker = ReturnType<typeof TimePicker>;
export default TimePicker;
