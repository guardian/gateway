import React, { useContext } from 'react';
import { css } from '@emotion/react';
import { space, brand } from '@guardian/src-foundations';
import { LinkButton } from '@guardian/src-button';
import { SvgGoogleBrand } from '@guardian/src-icons';
import { SvgAppleBrand } from '@guardian/src-icons';
import { SvgFacebookBrand } from '@guardian/src-icons';
import { from } from '@guardian/src-foundations/mq';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

type SocialButtonProps = {
  returnUrl?: string;
};

const buildUrl = (
  oauthBaseUrl: string,
  IdP: string,
  returnUrl?: string,
): string => {
  const returnUrlParam = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';
  return `${oauthBaseUrl}/${IdP}/signin${returnUrlParam}`;
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

export const SocialButtons = ({ returnUrl = '' }: SocialButtonProps) => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { clientHosts } = clientState;
  const { oauthBaseUrl } = clientHosts;
  return (
    <div css={containerStyles}>
      <LinkButton
        priority="tertiary"
        cssOverrides={[buttonOverrides, iconOverrides]}
        icon={<SvgGoogleBrand />}
        href={buildUrl(oauthBaseUrl, 'google', returnUrl)}
        data-cy="google-sign-in-button"
      >
        Google
      </LinkButton>
      <Gap />
      <LinkButton
        priority="tertiary"
        cssOverrides={buttonOverrides}
        icon={<SvgFacebookBrand />}
        href={buildUrl(oauthBaseUrl, 'facebook', returnUrl)}
        data-cy="facebook-sign-in-button"
      >
        Facebook
      </LinkButton>
      <Gap />
      <LinkButton
        priority="tertiary"
        cssOverrides={[buttonOverrides, iconOverrides]}
        icon={<SvgAppleBrand />}
        href={buildUrl(oauthBaseUrl, 'apple', returnUrl)}
        data-cy="apple-sign-in-button"
      >
        Apple
      </LinkButton>
    </div>
  );
};
