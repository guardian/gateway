import { css } from '@emotion/react';
import type { Meta } from '@storybook/react';
import React from 'react';
import { DeleteAccountReturnLink } from '@/client/components/DeleteAccountReturnLink';
import { CONTAINER_GAP } from '@/client/models/Style';

const flexStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${CONTAINER_GAP};
`;

export default {
	title: 'Components/DeleteAccountReturnLink',
	component: DeleteAccountReturnLink,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => (
	<div css={flexStyles}>
		<DeleteAccountReturnLink />
	</div>
);
Default.storyName = 'default';
