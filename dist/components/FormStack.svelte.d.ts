import type { Snippet } from 'svelte';
import type { HTMLFormAttributes } from 'svelte/elements';
interface Props extends HTMLFormAttributes {
    children: Snippet;
}
declare const FormStack: import("svelte").Component<Props, {}, "">;
type FormStack = ReturnType<typeof FormStack>;
export default FormStack;
