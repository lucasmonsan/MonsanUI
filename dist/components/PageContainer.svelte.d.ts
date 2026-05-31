import type { Snippet } from 'svelte';
interface Props {
    children?: Snippet;
    /**
     * Classes adicionais para customização
     */
    /**
     * Largura máxima do container. Por padrão usa a variável CSS global `--container-max-width`.
     */
    maxWidth?: string;
    /**
     * Padding interno do container. Por padrão é 0, mas você pode passar `var(--space-md)` etc.
     */
    padding?: string;
    /**
     * Applies the shared MonsanUI page entrance motion.
     */
    animate?: boolean;
}
declare const PageContainer: import("svelte").Component<Props, {}, "">;
type PageContainer = ReturnType<typeof PageContainer>;
export default PageContainer;
