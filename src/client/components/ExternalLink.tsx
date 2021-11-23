import {
  LinkButton,
  LinkButtonProps,
  Link,
  LinkProps,
} from '@guardian/source-react-components';
import React from 'react';

export const ExternalLink = (props: LinkProps) => (
  <Link {...props} rel="noopener noreferrer" />
);

export const ExternalLinkButton = (props: LinkButtonProps) => (
  <LinkButton {...props} rel="noopener noreferrer" />
);
