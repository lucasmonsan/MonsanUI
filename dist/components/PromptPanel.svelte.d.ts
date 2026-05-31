import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    condensed?: boolean;
}
declare const PromptPanel: import("svelte").Component<Props, {}, "">;
type PromptPanel = ReturnType<typeof PromptPanel>;
export default PromptPanel;
