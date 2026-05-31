interface Props {
    options: string[];
    value?: string[];
    disabled?: boolean;
    columns?: number;
    size?: 'sm' | 'md' | 'lg';
}
declare const MultipleChoice: import("svelte").Component<Props, {}, "value">;
type MultipleChoice = ReturnType<typeof MultipleChoice>;
export default MultipleChoice;
