interface ThemeOption {
    id: string;
    label: string;
}
type $$ComponentProps = {
    storageKey?: string;
    themes?: ThemeOption[];
    ariaLabel?: string;
};
declare const ThemeSelector: import("svelte").Component<$$ComponentProps, {}, "">;
type ThemeSelector = ReturnType<typeof ThemeSelector>;
export default ThemeSelector;
