import { css } from '@emotion/react';
import { ButtonLink } from '@guardian/source/react-components';
import type { Meta } from '@storybook/react';
import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import ThemedLink from '@/client/components/ThemedLink';

export default {
	title: 'Components/InformationBox',
	component: InformationBox,
	parameters: {
		layout: 'padded',
	},
} as Meta;

const buttonLinkStyles = css`
	color: var(--color-link);
	:hover {
		color: var(--color-link);
	}
`;

export const Default = () => (
	<InformationBox>
		<InformationBoxText>
			This is some useful stuff in the information box
		</InformationBoxText>
		<InformationBoxText>
			And some more useful stuff in the information box but this one is a{' '}
			<ThemedLink href="#">link</ThemedLink>.
		</InformationBoxText>
		<InformationBoxText>
			This also works with <ExternalLink href="#">external links</ExternalLink>{' '}
			too. As well as{' '}
			<ButtonLink css={buttonLinkStyles}>
				buttons that look like links
			</ButtonLink>
			.
		</InformationBoxText>
	</InformationBox>
);
Default.storyName = 'default';
