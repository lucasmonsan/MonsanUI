import type { Snippet } from 'svelte';
interface Props {
    value: string | number;
    label: string;
    children?: Snippet;
    onclick?: (event: MouseEvent) => void;
}
declare const MetricButton: import("svelte").Component<Props, {}, "">;
type MetricButton = ReturnType<typeof MetricButton>;
export default MetricButton;
