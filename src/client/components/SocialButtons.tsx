import React from 'react';
import { css } from '@emotion/react';
import { space, sport } from '@guardian/src-foundations';
import { Button } from '@guardian/src-button';
import { SvgGoogle } from '../icons/SvgGoogle';
import { SvgApple } from '../icons/SvgApple';
import { SvgFacebook } from '../icons/SvgFacebook';

const containerStyles = css`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  margin: ${space[9]}px 0;
`;

const buttonOverrides = css`
  border-color: ${sport[500]};
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

export const SocialButtons = () => (
  <div css={containerStyles}>
    <Button
      priority="tertiary"
      cssOverrides={buttonOverrides}
      icon={<SvgFacebook />}
    >
      Facebook
    </Button>
    <Gap />
    <Button
      priority="tertiary"
      cssOverrides={buttonOverrides}
      icon={<SvgGoogle />}
    >
      Google
    </Button>
    <Gap />
    <Button
      priority="tertiary"
      cssOverrides={buttonOverrides}
      icon={<SvgApple />}
    >
      Apple
    </Button>
  </div>
);
