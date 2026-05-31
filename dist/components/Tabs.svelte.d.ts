import type { Component, Snippet } from 'svelte';
type IconComponent = Component<{
    size?: number;
}>;
interface TabItem {
    id: string;
    label: string;
    icon?: IconComponent;
}
type $$ComponentProps = {
    value: string;
    items: TabItem[];
    wrap?: boolean;
    variant?: 'default' | 'underline';
    scrollable?: boolean;
    showNavButtons?: boolean;
    hideLabels?: boolean;
    onchange?: (value: string) => void;
    item?: Snippet<[TabItem, number]>;
};
declare const Tabs: Component<$$ComponentProps, {}, "value">;
type Tabs = ReturnType<typeof Tabs>;
export default Tabs;
