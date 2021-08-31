import React from 'react';
import { css } from '@emotion/react';
import { space, brand } from '@guardian/src-foundations';
import { LinkButton } from '@guardian/src-button';
import { SvgGoogleBrand } from '@guardian/src-icons';
import { SvgAppleBrand } from '@guardian/src-icons';
import { SvgFacebookBrand } from '@guardian/src-icons';
import { from } from '@guardian/src-foundations/mq';

type Props = {
  returnUrl: string;
};

const containerStyles = css`
  display: flex;
  flex-direction: column;
  ${from.mobileLandscape} {
    flex-direction: row;
  }
  justify-content: center;
  margin-top: ${space[12]}px;
  margin-bottom: ${space[12]}px;
  width: 100%;
`;

const buttonOverrides = css`
  border-color: ${brand[400]};
  justify-content: flex-end;
  ${from.mobileLandscape} {
    min-width: 145px;
  }
`;

// TODO: If the issue below is fixed and a new version of Source published with that fix in it, then
// you should remove this iconOverrides css
// https://github.com/guardian/source/issues/835
const iconOverrides = css`
  svg {
    margin-top: 3px;
  }
`;

const Gap = () => (
  <span
    css={css`
      width: 0;
      height: ${space[3]}px;
      ${from.mobileLandscape} {
        width: ${space[2]}px;
        height: 0;
      }
    `}
  ></span>
);

export const SocialButtons = ({ returnUrl }: Props) => (
  <div css={containerStyles}>
    <LinkButton
      priority="tertiary"
      cssOverrides={buttonOverrides}
      icon={<SvgFacebookBrand />}
      href={`https://oauth.theguardian.com/facebook/signin?returnUrl=${returnUrl}`}
    >
      Facebook
    </LinkButton>
    <Gap />
    <LinkButton
      priority="tertiary"
      cssOverrides={[buttonOverrides, iconOverrides]}
      icon={<SvgGoogleBrand />}
      href={`https://oauth.theguardian.com/google/signin?returnUrl=${returnUrl}`}
    >
      Google
    </LinkButton>
    <Gap />
    <LinkButton
      priority="tertiary"
      cssOverrides={[buttonOverrides, iconOverrides]}
      icon={<SvgAppleBrand />}
      href={`https://oauth.theguardian.com/apple/signin?returnUrl=${returnUrl}`}
    >
      Apple
    </LinkButton>
  </div>
);
