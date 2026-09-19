import assert from 'node:assert/strict';
import { contrastForeground } from '../src/lib/utils/color-contrast.js';

function luminance(hex) {
	const value = Number.parseInt(hex.slice(1), 16);
	return [value >> 16, (value >> 8) & 255, value & 255].reduce((sum, byte, index) => {
		const channel = byte / 255;
		return (
			sum +
			[0.2126, 0.7152, 0.0722][index] *
				(channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4))
		);
	}, 0);
}
const colors = new Set(['#c05c4b', '#808080', '#ffffff', '#000000']);
for (let r = 0; r <= 255; r += 17) {
	for (let g = 0; g <= 255; g += 17) {
		for (let b = 0; b <= 255; b += 17)
			colors.add('#' + [r, g, b].map((value) => value.toString(16).padStart(2, '0')).join(''));
	}
}
for (const color of colors) {
	const foreground = contrastForeground(color);
	const values = [luminance(color), luminance(foreground)].sort((a, b) => b - a);
	assert.ok(
		(values[0] + 0.05) / (values[1] + 0.05) >= 4.5,
		`Unreadable foreground ${foreground} on ${color}`
	);
}
for (const color of [undefined, '', '#fff', 'red', '#gggggg'])
	assert.equal(contrastForeground(color), undefined);
console.log(`Color contrast: ${colors.size} surfaces satisfy 4.5:1.`);
