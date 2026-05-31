import type { HTMLInputAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends Omit<HTMLInputAttributes, 'value' | 'type' | 'files'> {
    files?: FileList | null;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    placeholder?: string;
    variant?: 'default' | 'invisible' | 'compact' | 'overlay';
    /** Trigger snippet for variant="invisible". */
    trigger?: Snippet<[{
        open: () => void;
    }]>;
    /** Button text for variants that show a browse button. */
    buttonLabel?: string;
    class?: string;
}
declare const FileUpload: import("svelte").Component<Props, {}, "files">;
type FileUpload = ReturnType<typeof FileUpload>;
export default FileUpload;
