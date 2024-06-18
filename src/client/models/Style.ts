// sourced from https://theguardian.design/2a1e5182b/p/41be19-grids

import { remSpace } from '@guardian/source/foundations';

// Grid columns are 60px on desktop, 40px on tablet.
// Gaps between columns are always 20px.
const gridToPixels = (
	columns: number,
	device: 'tablet' | 'desktop',
): number => {
	switch (device) {
		case 'tablet':
			return 40 * columns + 20 * (columns - 1);
		case 'desktop':
		default:
			return 60 * columns + 20 * (columns - 1);
	}
};

export const LAYOUT_WIDTH_NARROW = gridToPixels(6, 'desktop'); // 460px

export const LAYOUT_WIDTH_WIDE = gridToPixels(12, 'desktop'); // 940px

// The gap between elements in the main container of MinimalLayout (the header,
// lead text, image, and main section).
export const CONTAINER_GAP = remSpace[5]; // 20px

// The gap between elements in the main section of MinimalLayout.
export const SECTION_GAP = remSpace[3]; // 12px
