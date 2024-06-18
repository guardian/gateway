import {
	LinkButton,
	LinkButtonProps,
	LinkProps,
} from '@guardian/source/react-components';
import React from 'react';
import ThemedLink from '@/client/components/ThemedLink';

export const ExternalLink = (props: LinkProps) => (
	<ThemedLink {...props} rel="noopener noreferrer" />
);

export const ExternalLinkButton = (props: LinkButtonProps) => (
	<LinkButton {...props} rel="noopener noreferrer" />
);
