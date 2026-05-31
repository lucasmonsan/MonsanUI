import type { HTMLTextareaAttributes } from 'svelte/elements';
interface Props extends HTMLTextareaAttributes {
    value?: string;
    use?: (node: HTMLTextAreaElement, value?: string) => void | {
        update?: (value?: string) => void;
        destroy?: () => void;
    };
    size?: 'sm' | 'md';
    rows?: number;
}
declare const Textarea: import("svelte").Component<Props, {}, "value">;
type Textarea = ReturnType<typeof Textarea>;
export default Textarea;
