interface Option {
    value: string | number;
    label: string;
}
type $$ComponentProps = {
    value: string | number;
    options: Option[];
    placeholder?: string;
    id?: string;
    showChevron?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    disabled?: boolean;
};
declare const Select: import("svelte").Component<$$ComponentProps, {}, "value">;
type Select = ReturnType<typeof Select>;
export default Select;
