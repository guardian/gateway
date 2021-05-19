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
  margin: ${space[9]}px 0;
`;

const borderColorStyles = css`
  border-color: ${sport[500]};
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
      cssOverrides={borderColorStyles}
      icon={<SvgFacebook />}
    >
      Facebook
    </Button>
    <Gap />
    <Button
      priority="tertiary"
      cssOverrides={borderColorStyles}
      icon={<SvgGoogle />}
    >
      Google
    </Button>
    <Gap />
    <Button
      priority="tertiary"
      cssOverrides={borderColorStyles}
      icon={<SvgApple />}
    >
      Apple
    </Button>
  </div>
);
