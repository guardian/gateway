import { LinkButton, LinkButtonProps } from '@guardian/src-button';
import { Link, LinkProps } from '@guardian/src-link';
import React from 'react';

export const ExternalLink = (props: LinkProps) => (
  <Link {...props} rel="noopener noreferrer" />
);

export const ExternalLinkButton = (props: LinkButtonProps) => (
  <LinkButton {...props} rel="noopener noreferrer" />
);
