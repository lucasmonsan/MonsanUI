interface CalendarEvent {
    title: string;
    time?: string;
    description?: string;
    color?: 'default' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'red';
}
interface Props {
    studyLogs?: Record<string, number>;
    events?: Record<string, CalendarEvent[]>;
    mode?: 'heatmap' | 'calendar' | 'week' | 'list';
    title?: string;
    weekDayLabels?: string[];
    selectedDate?: string | null;
    onSelectDate?: (dateStr: string) => void;
}
declare const Calendar: import("svelte").Component<Props, {}, "selectedDate">;
type Calendar = ReturnType<typeof Calendar>;
export default Calendar;
