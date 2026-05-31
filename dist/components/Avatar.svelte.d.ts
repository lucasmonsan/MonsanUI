interface Props {
    src?: string;
    name?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | number;
    shape?: 'circle' | 'square';
    class?: string;
    [key: string]: unknown;
}
declare const Avatar: import("svelte").Component<Props, {}, "">;
type Avatar = ReturnType<typeof Avatar>;
export default Avatar;
