import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    maxWidth?: string;
    align?: 'center' | 'start';
    animate?: boolean;
    fullHeight?: boolean;
    padding?: string;
}
declare const CenteredPanel: import("svelte").Component<Props, {}, "">;
type CenteredPanel = ReturnType<typeof CenteredPanel>;
export default CenteredPanel;
