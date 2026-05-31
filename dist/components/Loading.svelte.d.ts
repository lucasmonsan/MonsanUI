interface Props {
    /** Exibe ou oculta o loading */
    active?: boolean;
    /** Mensagem customizada. Se não fornecida, usa o i18n padrão */
    message?: string;
    [key: string]: unknown;
}
declare const Loading: import("svelte").Component<Props, {}, "">;
type Loading = ReturnType<typeof Loading>;
export default Loading;
