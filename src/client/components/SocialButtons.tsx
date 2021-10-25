import React from 'react';
import { css } from '@emotion/react';
import { space, brand } from '@guardian/src-foundations';
import { LinkButton } from '@guardian/src-button';
import { SvgGoogleBrand } from '@guardian/src-icons';
import { SvgAppleBrand } from '@guardian/src-icons';
import { SvgFacebookBrand } from '@guardian/src-icons';
import { from } from '@guardian/src-foundations/mq';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { addReturnUrlToPath } from '@/server/lib/queryParams';

type SocialButtonProps = {
  returnUrl?: string;
};

enum IdP {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

const buildUrl = (returnUrl: string | undefined, IdP: string): string => {
  const { oauthBaseUrl } = getConfiguration();
  const url = `${oauthBaseUrl}/${IdP}/signin`;
  return returnUrl ? addReturnUrlToPath(url, returnUrl) : url;
};

const containerStyles = css`
  display: flex;
  flex-direction: column;
  ${from.tablet} {
    flex-direction: row;
  }
  justify-content: center;
  margin-top: ${space[5]}px;
  ${from.mobileMedium} {
    margin-top: ${space[6]}px;
  }
  margin-bottom: 60px;
  ${from.desktop} {
    margin-bottom: ${space[24]}px;
  }
  width: 100%;
`;

const buttonOverrides = css`
  border-color: ${brand[400]};
  justify-content: center;
  ${from.tablet} {
    min-width: 145px;
    flex-grow: 1;
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
      ${from.tablet} {
        width: ${space[3]}px;
        height: 0;
      }
    `}
  ></span>
);

export const SocialButtons = ({ returnUrl = '' }: SocialButtonProps) => (
  <div css={containerStyles}>
    <LinkButton
      priority="tertiary"
      cssOverrides={[buttonOverrides, iconOverrides]}
      icon={<SvgGoogleBrand />}
      href={buildUrl(returnUrl, IdP.GOOGLE)}
      data-cy={`${IdP.GOOGLE}-sign-in-button`}
    >
      Google
    </LinkButton>
    <Gap />
    <LinkButton
      priority="tertiary"
      cssOverrides={buttonOverrides}
      icon={<SvgFacebookBrand />}
      href={buildUrl(returnUrl, IdP.FACEBOOK)}
      data-cy={`${IdP.FACEBOOK}-sign-in-button`}
    >
      Facebook
    </LinkButton>
    <Gap />
    <LinkButton
      priority="tertiary"
      cssOverrides={[buttonOverrides, iconOverrides]}
      icon={<SvgAppleBrand />}
      href={buildUrl(returnUrl, IdP.APPLE)}
      data-cy={`${IdP.APPLE}-sign-in-button`}
    >
      Apple
    </LinkButton>
  </div>
);
