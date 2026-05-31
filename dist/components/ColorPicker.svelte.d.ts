import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'value' | 'type'> {
    value?: string;
    disabled?: boolean;
    class?: string;
}
declare const ColorPicker: import("svelte").Component<Props, {}, "value">;
type ColorPicker = ReturnType<typeof ColorPicker>;
export default ColorPicker;
