import React from 'react';
import { css } from '@emotion/react';
import { space, brand } from '@guardian/src-foundations';
import { LinkButton } from '@guardian/src-button';
import { SvgGoogle } from '../icons/SvgGoogle';
import { SvgApple } from '../icons/SvgApple';
import { SvgFacebook } from '../icons/SvgFacebook';

type Props = {
  returnUrl: string;
};

const containerStyles = css`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  margin: ${space[9]}px 0;
`;

const buttonOverrides = css`
  border-color: ${brand[400]};
  justify-content: flex-end;
  min-width: 145px;
`;

const Gap = () => (
  <span
    css={css`
      width: ${space[2]}px;
    `}
  ></span>
);

export const SocialButtons = ({ returnUrl }: Props) => (
  <div css={containerStyles}>
    <LinkButton
      priority="tertiary"
      cssOverrides={buttonOverrides}
      icon={<SvgFacebook />}
      href={`https://oauth.theguardian.com/facebook/signin?returnUrl=${returnUrl}`}
    >
      Facebook
    </LinkButton>
    <Gap />
    <LinkButton
      priority="tertiary"
      cssOverrides={buttonOverrides}
      icon={<SvgGoogle />}
      href={`https://oauth.theguardian.com/google/signin?returnUrl=${returnUrl}`}
    >
      Google
    </LinkButton>
    <Gap />
    <LinkButton
      priority="tertiary"
      cssOverrides={buttonOverrides}
      icon={<SvgApple />}
      href={`https://oauth.theguardian.com/apple/signin?returnUrl=${returnUrl}`}
    >
      Apple
    </LinkButton>
  </div>
);
