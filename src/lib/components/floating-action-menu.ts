import type { Component } from 'svelte';

export type FloatingActionIcon = Component<{ size?: number | string }>;

export type FloatingActionMenuItem = {
	id: string;
	label: string;
	icon: FloatingActionIcon;
	onSelect: () => void;
	variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'neutral';
	disabled?: boolean;
};
