import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'value' | 'size'> {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    suggestions?: string[];
    class?: string;
}
declare const SearchBar: import("svelte").Component<Props, {}, "value">;
type SearchBar = ReturnType<typeof SearchBar>;
export default SearchBar;
