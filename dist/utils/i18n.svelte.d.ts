declare class I18n {
    currentLocale: string;
    translations: Record<string, Record<string, unknown>>;
    constructor(initialLocale?: string, initialTranslations?: Record<string, Record<string, unknown>>);
    setLocale(locale: string): void;
    get locale(): string;
    set locale(value: string);
    addTranslations(locale: string, dict: Record<string, unknown>): void;
    t(key: string, replacements?: Record<string, string | number>): string;
}
export declare const i18n: I18n;
export {};
