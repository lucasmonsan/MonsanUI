export interface Card {
	id: string;
	front: string;
	back: string;
	hint?: string;
	lastReviewed?: string;
	history: ('success' | 'error' | 'neutral')[];
	level?: number;
	nextReview?: string;
	isHintVisible?: boolean;
}

export interface Folder {
	id: string;
	name: string;
	color?: string;
}

export interface Deck {
	id: string;
	name: string;
	cards: Card[];
	theme?: 'default' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'red';
	folderId?: string;
}

export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
	actionLabel?: string;
	onAction?: () => void | Promise<void>;
	/** Keeps the notification visible until the user dismisses or resolves it. */
	persistent?: boolean;
	/** Overrides the automatic dismissal delay in milliseconds. */
	duration?: number;
}

export interface SearchResultItem {
	id: string;
	name: string;
	type: string;
	iconName?: string;
}

export interface CommandPaletteCommand {
	id: string;
	label: string;
	description?: string;
	shortcut?: string;
	disabled?: boolean;
}

export interface DataTableColumn {
	id: string;
	label: string;
	align?: 'start' | 'end';
	sortable?: boolean;
}

export interface DataTableRow {
	id: string;
	cells: Array<string | number | null | undefined>;
	selectable?: boolean;
	muted?: boolean;
}
