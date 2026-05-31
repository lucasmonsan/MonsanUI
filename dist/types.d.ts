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
}
export interface SearchResultItem {
    id: string;
    name: string;
    type: string;
    iconName?: string;
}
