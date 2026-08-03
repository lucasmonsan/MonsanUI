let activeNativePickerCount = 0;

/**
 * Native file and color pickers use OS-owned windows. Their Escape event can
 * return to the browser after the picker is cancelled, so dialogs need to know
 * that the Escape belongs to the picker rather than to the dialog itself.
 */
export function beginNativePicker(): () => void {
	activeNativePickerCount += 1;
	let finished = false;
	return () => {
		if (finished) return;
		finished = true;
		activeNativePickerCount = Math.max(0, activeNativePickerCount - 1);
	};
}

export function hasActiveNativePicker(): boolean {
	return activeNativePickerCount > 0;
}
