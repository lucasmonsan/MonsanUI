interface Props {
    options: string[];
    value?: string | null;
    disabled?: boolean;
    columns?: number;
    size?: 'sm' | 'md' | 'lg';
}
declare const SingleChoice: import("svelte").Component<Props, {}, "value">;
type SingleChoice = ReturnType<typeof SingleChoice>;
export default SingleChoice;
