import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    warning?: boolean;
}
declare const CountdownBadge: import("svelte").Component<Props, {}, "">;
type CountdownBadge = ReturnType<typeof CountdownBadge>;
export default CountdownBadge;
