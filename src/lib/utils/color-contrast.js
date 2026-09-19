/** Choose a foreground with at least 4.5:1 contrast on any opaque six-digit hex surface.
 * @param {string | undefined} color
 */
export function contrastForeground(color) {
	if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return undefined;
	const channels = [1, 3, 5].map(
		(index) => Number.parseInt(color.slice(index, index + 2), 16) / 255
	);
	const luminance = channels
		.map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
		.reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
	return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#ffffff';
}
