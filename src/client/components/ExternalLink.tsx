import {
	LinkButton,
	LinkButtonProps,
	LinkProps,
} from '@guardian/source-react-components';
import React from 'react';
import Link from './Link';

export const ExternalLink = (props: LinkProps) => (
	<Link {...props} rel="noopener noreferrer" />
);

export const ExternalLinkButton = (props: LinkButtonProps) => (
	<LinkButton {...props} rel="noopener noreferrer" />
);
