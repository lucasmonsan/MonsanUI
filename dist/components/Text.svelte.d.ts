import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
    children: Snippet;
    /** Tag HTML a ser renderizada. Padrão: 'p' */
    tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label' | 'small';
    /** Família tipográfica do MonsanUI. Padrão: 'body' (Plus Jakarta Sans) */
    family?: 'body' | 'display';
    /** Tamanho do texto mapeado na escala. Padrão: 'md' */
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    /** Peso da fonte. Padrão: 'normal' */
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    /** Variante de cor do MonsanUI. Padrão: 'primary' */
    variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral';
    truncate?: boolean;
}
declare const Text: import("svelte").Component<Props, {}, "">;
type Text = ReturnType<typeof Text>;
export default Text;
