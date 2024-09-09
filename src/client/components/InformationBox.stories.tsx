import React from 'react';
import { Meta } from '@storybook/react';

import {
	InformationBoxText,
	InformationBox,
} from '@/client/components/InformationBox';
import { ButtonLink } from '@guardian/source/react-components';
import { ExternalLink } from '@/client/components/ExternalLink';
import ThemedLink from '@/client/components/ThemedLink';
import { css } from '@emotion/react';

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
			<ButtonLink cssOverrides={buttonLinkStyles}>
				buttons that look like links
			</ButtonLink>
			.
		</InformationBoxText>
	</InformationBox>
);
Default.storyName = 'default';
