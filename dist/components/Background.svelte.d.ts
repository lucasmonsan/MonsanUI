interface Props {
    pattern?: 'grid' | 'dots' | 'diagonal' | 'lines' | 'horizontal';
    local?: boolean;
    animate?: boolean;
    direction?: 'up' | 'down' | 'left' | 'right' | 'diagonal' | 'diagonal-reverse';
}
declare const Background: import("svelte").Component<Props, {}, "">;
type Background = ReturnType<typeof Background>;
export default Background;
