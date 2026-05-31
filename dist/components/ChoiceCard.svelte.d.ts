import type { Component } from 'svelte';
interface Props {
    title: string;
    description?: string;
    actionLabel?: string;
    variant?: 'default' | 'accent';
    disabled?: boolean;
    onclick?: () => void;
    icon?: Component<{
        size?: number;
    }>;
}
declare const ChoiceCard: Component<Props, {}, "">;
type ChoiceCard = ReturnType<typeof ChoiceCard>;
export default ChoiceCard;
