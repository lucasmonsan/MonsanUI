interface LocaleOption {
    id: string;
    label: string;
    name?: string;
}
interface Props {
    value: string;
    locales?: LocaleOption[];
    onChange?: (localeId: string) => void;
    ariaLabel?: string;
    title?: string;
}
declare const LanguageSelector: import("svelte").Component<Props, {}, "value">;
type LanguageSelector = ReturnType<typeof LanguageSelector>;
export default LanguageSelector;
