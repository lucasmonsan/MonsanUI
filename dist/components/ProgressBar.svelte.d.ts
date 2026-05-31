interface Props {
    value?: number;
    height?: string;
    class?: string;
    showLabel?: boolean;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
    striped?: boolean;
    animated?: boolean;
    [key: string]: unknown;
}
declare const ProgressBar: import("svelte").Component<Props, {}, "">;
type ProgressBar = ReturnType<typeof ProgressBar>;
export default ProgressBar;
