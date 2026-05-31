type $$ComponentProps = {
    isOpen: boolean;
    mediaType: 'image' | 'video' | 'audio' | 'youtube' | 'none' | string;
    mediaUrl: string;
    onClose: () => void;
    closeAriaLabel?: string;
    imageAlt?: string;
    videoTitle?: string;
    title?: string;
    notSupportedMessage?: string;
};
declare const MediaDialog: import("svelte").Component<$$ComponentProps, {}, "isOpen">;
type MediaDialog = ReturnType<typeof MediaDialog>;
export default MediaDialog;
