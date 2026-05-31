import type { Component, Snippet } from 'svelte';
type IconComponent = Component<{
    size?: number;
}>;
interface ActionItem {
    id: string;
    label: string;
    icon?: IconComponent;
    flex?: number | string;
    onlyIcon?: boolean;
    folderTheme?: string;
    title?: string;
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
}
type $$ComponentProps = {
    items: ActionItem[];
    item?: Snippet<[ActionItem, number]>;
};
declare const ActionBar: Component<$$ComponentProps, {}, "">;
type ActionBar = ReturnType<typeof ActionBar>;
export default ActionBar;
