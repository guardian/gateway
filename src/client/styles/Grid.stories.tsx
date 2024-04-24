import React from 'react';
import { Meta } from '@storybook/react';
import {
	getAutoRow,
	gridRow,
	manualRow,
	SpanDefinition,
} from '@/client/styles/Grid';

export default {
	title: 'Styles/Grid',
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Basic = () => {
	const autoRow = getAutoRow();

	return (
		<div css={gridRow}>
			<div css={[autoRow(), { backgroundColor: 'lightseagreen' }]}>
				This is an item in a grid
			</div>
			<div css={[autoRow(), { backgroundColor: 'lightsteelblue' }]}>
				This is another item in a grid, in another row
			</div>
		</div>
	);
};
Basic.storyName = 'Basic layout using autoRow';

export const CustomSpanDefinition = () => {
	const customSpanDefinition: SpanDefinition = {
		TABLET: { start: 2, span: 4 },
		DESKTOP: { start: 3, span: 6 },
		LEFT_COL: { start: 4, span: 8 },
		WIDE: { start: 5, span: 10 },
	};

	const manualSpanDefinition: SpanDefinition = {
		TABLET: { start: 2, span: 3 },
		DESKTOP: { start: 3, span: 5 },
		LEFT_COL: { start: 4, span: 7 },
		WIDE: { start: 5, span: 9 },
	};

	const autoRow = getAutoRow(0, customSpanDefinition);

	return (
		<div css={gridRow}>
			<div css={[autoRow(), { backgroundColor: 'lightseagreen' }]}>
				this is using a customSpanDefinition in getAutoRow
			</div>
			<div
				css={[
					autoRow(manualSpanDefinition),
					{ backgroundColor: 'lightsteelblue' },
				]}
			>
				this is using a different manualSpanDefinition for this item in autoRow
			</div>
		</div>
	);
};
CustomSpanDefinition.storyName = 'CustomSpanDefinition layout using autoRow';

export const Manual = () => {
	const customSpanDefinition: SpanDefinition = {
		TABLET: { start: 2, span: 4 },
		DESKTOP: { start: 3, span: 6 },
		LEFT_COL: { start: 4, span: 8 },
		WIDE: { start: 5, span: 10 },
	};

	return (
		<div css={gridRow}>
			<div css={[manualRow(2), { backgroundColor: 'lightseagreen' }]}>
				This is an item in a grid row, manually set to row 2
			</div>
			<div
				css={[
					manualRow(1, customSpanDefinition),
					{ backgroundColor: 'lightsteelblue' },
				]}
			>
				This is another item in a grid, manually set to row 1 with a
				customSpanDefinition
			</div>
		</div>
	);
};
Manual.storyName = 'Manualrow layout using';
