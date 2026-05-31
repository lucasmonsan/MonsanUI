import type { Snippet } from 'svelte';
interface Props {
    label: string;
    forId: string;
    children: Snippet;
}
declare const FormField: import("svelte").Component<Props, {}, "">;
type FormField = ReturnType<typeof FormField>;
export default FormField;
