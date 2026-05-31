interface Folder {
    id: string;
    name: string;
    color?: string;
}
interface Props {
    items: Folder[];
    activeId: string | null;
    onSelect?: (id: string | null) => void;
    layout?: 'horizontal' | 'grid' | 'wrap';
    editingFolderId?: string | null;
    mode?: 'select' | 'edit' | 'delete';
    onAction?: (mode: 'edit' | 'delete', folderId: string) => void;
    onCreateFolder?: (name: string, color: string) => void | Folder;
    onUpdateFolder?: (id: string, name: string, color: string) => void;
    onWarning?: (message: string) => void;
    showCreateModal?: boolean;
    hideAddButton?: boolean;
    labels?: {
        allFolders: string;
        newFolder: string;
        editFolder: string;
        folderNameLabel: string;
        folderNamePlaceholder: string;
        folderColorLabel: string;
        cancel: string;
        save: string;
        create: string;
        cannotDeleteAllFolder: string;
        edit?: string;
        delete?: string;
        options?: string;
    };
}
declare const Folders: import("svelte").Component<Props, {}, "activeId" | "editingFolderId" | "showCreateModal">;
type Folders = ReturnType<typeof Folders>;
export default Folders;
