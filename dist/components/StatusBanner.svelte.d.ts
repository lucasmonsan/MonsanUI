import type { Snippet } from 'svelte';
interface Props {
    children: Snippet;
    pulse?: boolean;
    role?: 'status' | 'alert';
}
declare const StatusBanner: import("svelte").Component<Props, {}, "">;
type StatusBanner = ReturnType<typeof StatusBanner>;
export default StatusBanner;
