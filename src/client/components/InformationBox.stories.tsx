import React from 'react';
import { Meta } from '@storybook/react';

import {
	InformationBoxText,
	InformationBox,
} from '@/client/components/InformationBox';
import { ButtonLink, Link } from '@guardian/source-react-components';
import { ExternalLink } from '@/client/components/ExternalLink';

export default {
	title: 'Components/InformationBox',
	component: InformationBox,
} as Meta;

export const Default = () => (
	<InformationBox>
		<InformationBoxText>
			This is some useful stuff in the information box
		</InformationBoxText>
		<InformationBoxText>
			And some more useful stuff in the information box but this one is a{' '}
			<Link href="#">link</Link>.
		</InformationBoxText>
		<InformationBoxText>
			This also works with <ExternalLink href="#">external links</ExternalLink>{' '}
			too. As well as <ButtonLink>buttons that look like links</ButtonLink>.
		</InformationBoxText>
	</InformationBox>
);
Default.storyName = 'default';

export const WithMarginTop = () => (
	<InformationBox withMarginTop>
		<InformationBoxText>
			This is some useful stuff in the information box, with a margin top!
		</InformationBoxText>
		<InformationBoxText>
			And some more useful stuff in the information box but this one is a{' '}
			<Link href="#">link</Link>.
		</InformationBoxText>
		<InformationBoxText>
			This also works with <ExternalLink href="#">external links</ExternalLink>{' '}
			too. As well as <ButtonLink>buttons that look like links</ButtonLink>.
		</InformationBoxText>
	</InformationBox>
);
WithMarginTop.storyName = 'withMarginTop';
