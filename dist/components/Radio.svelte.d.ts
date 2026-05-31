import type { HTMLInputAttributes } from 'svelte/elements';
declare function $$render<T>(): {
    props: Omit<HTMLInputAttributes, "size" | "group" | "value"> & {
        group?: T;
        value: T;
        disabled?: boolean;
        label?: string;
        size?: "sm" | "md";
        class?: string;
    };
    exports: {};
    bindings: "group";
    slots: {};
    events: {};
};
declare class __sveltets_Render<T> {
    props(): ReturnType<typeof $$render<T>>['props'];
    events(): ReturnType<typeof $$render<T>>['events'];
    slots(): ReturnType<typeof $$render<T>>['slots'];
    bindings(): "group";
    exports(): {};
}
interface $$IsomorphicComponent {
    new <T>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<T>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<T>['props']>, ReturnType<__sveltets_Render<T>['events']>, ReturnType<__sveltets_Render<T>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<T>['bindings']>;
    } & ReturnType<__sveltets_Render<T>['exports']>;
    <T>(internal: unknown, props: ReturnType<__sveltets_Render<T>['props']> & {}): ReturnType<__sveltets_Render<T>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const Radio: $$IsomorphicComponent;
type Radio<T> = InstanceType<typeof Radio<T>>;
export default Radio;
