import type { Snippet } from 'svelte';
interface Props {
    /** Name of the application */
    appName: string;
    /** Path to the logo image file */
    logoSrc?: string;
    /** Alt text for the logo image */
    logoAlt?: string;
    /** If true, holds the splash screen visible beyond the 2s minimum */
    loading?: boolean;
    /** Author name for the Credits component */
    authorName?: string;
    /** Author profile/website link for the Credits component */
    authorLink?: string;
    /** Copyright text for the Credits component */
    copyright?: string;
    /** z-index of the splash container. Defaults to 9999. */
    zIndex?: number;
    /** Svelte 5 snippet for custom logo rendering */
    logoSnippet?: Snippet;
    /** Custom children snippet, takes precedence over default content */
    children?: Snippet;
    /** Variant of the Credits component. Defaults to 'default' */
    creditsVariant?: 'default' | 'compact';
}
declare const SplashScreen: import("svelte").Component<Props, {}, "">;
type SplashScreen = ReturnType<typeof SplashScreen>;
export default SplashScreen;
