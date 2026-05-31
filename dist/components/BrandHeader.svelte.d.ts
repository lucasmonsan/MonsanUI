interface Props {
    brand: string;
    subtitle?: string;
    logoSrc?: string;
    logoAlt?: string;
    layout?: 'stacked' | 'inline';
    compact?: boolean;
    titleWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    adaptiveLogo?: boolean;
    logoButtonLabel?: string;
    onLogoClick?: () => void;
}
declare const BrandHeader: import("svelte").Component<Props, {}, "">;
type BrandHeader = ReturnType<typeof BrandHeader>;
export default BrandHeader;
