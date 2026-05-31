export type VFSNode = {
    type: 'dir';
    children: Record<string, VFSNode>;
} | {
    type: 'file';
};
export interface TerminalMessages {
    welcome?: (mode: string) => string;
    unrecognized?: (cmd: string) => string;
    pathNotFound?: string;
    destExists?: string;
    originalNotFound?: string;
    usageMv?: string;
    fileNotFoundSimple?: string;
    usageRm?: string;
    fileNotFound?: string;
    contentDisplayed?: (file: string) => string;
    usageType?: string;
    usageTouch?: string;
    dirNotFound?: string;
    notEmpty?: (target: string) => string;
    cannotRemoveHome?: string;
    usageRmdir?: string;
    exists?: (name: string) => string;
    usageMkdir?: string;
    emptyDir?: string;
    lostDir?: string;
    cmdNotAvailable?: (cmd: string, mode: string) => string;
    errorProcess?: string;
    tabTerminal?: string;
    tabFiles?: string;
    explorerHeader?: string;
    explorerRoot?: string;
    itemExists?: (target: string) => string;
}
interface Props {
    initialVFS?: Record<string, VFSNode>;
    filesystem?: Record<string, VFSNode>;
    onCommand?: (command: string) => void;
    disabled?: boolean;
    osMode?: 'linux' | 'windows' | 'both';
    messages?: TerminalMessages;
}
declare const Terminal: import("svelte").Component<Props, {}, "filesystem">;
type Terminal = ReturnType<typeof Terminal>;
export default Terminal;
