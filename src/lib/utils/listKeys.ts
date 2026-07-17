export function getOccurrenceKey(items: readonly string[], index: number): string {
	const item = items[index] ?? '';
	let occurrence = 0;

	for (let current = 0; current < index; current += 1) {
		if (items[current] === item) occurrence += 1;
	}

	return JSON.stringify([item, occurrence]);
}
