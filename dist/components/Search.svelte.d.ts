import type { SearchResultItem } from '../types.js';
type $$ComponentProps = {
    open: boolean;
    items: SearchResultItem[];
    onSelectResult?: (item: SearchResultItem) => void;
    title?: string;
    placeholder?: string;
    noResultsMessage?: string;
};
declare const Search: import("svelte").Component<$$ComponentProps, {}, "open">;
type Search = ReturnType<typeof Search>;
export default Search;
