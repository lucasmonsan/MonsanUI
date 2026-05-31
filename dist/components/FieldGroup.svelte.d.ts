import type { Snippet } from 'svelte';
interface Props {
    label: string;
    children: Snippet;
}
declare const FieldGroup: import("svelte").Component<Props, {}, "">;
type FieldGroup = ReturnType<typeof FieldGroup>;
export default FieldGroup;
