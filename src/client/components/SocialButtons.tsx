import React from 'react';
import { css } from '@emotion/react';
import { space, brand, from } from '@guardian/source-foundations';
import {
  LinkButton,
  SvgGoogleBrand,
  SvgAppleBrand,
  SvgFacebookBrand,
} from '@guardian/source-react-components';
import { QueryParams } from '@/shared/model/QueryParams';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';

type SocialButtonProps = {
  queryParams: QueryParams;
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

export const SocialButtons = ({ queryParams }: SocialButtonProps) => {
  return (
    <div css={containerStyles}>
      <LinkButton
        priority="tertiary"
        cssOverrides={[buttonOverrides, iconOverrides]}
        icon={<SvgGoogleBrand />}
        href={buildUrlWithQueryParams(
          '/signin/:social',
          {
            social: 'google',
          },
          queryParams,
        )}
        data-cy="google-sign-in-button"
        data-link-name="google-social-button"
      >
        Google
      </LinkButton>
      <Gap />
      <LinkButton
        priority="tertiary"
        cssOverrides={buttonOverrides}
        icon={<SvgFacebookBrand />}
        href={buildUrlWithQueryParams(
          '/signin/:social',
          {
            social: 'facebook',
          },
          queryParams,
        )}
        data-cy="facebook-sign-in-button"
        data-link-name="facebook-social-button"
      >
        Facebook
      </LinkButton>
      <Gap />
      <LinkButton
        priority="tertiary"
        cssOverrides={[buttonOverrides, iconOverrides]}
        icon={<SvgAppleBrand />}
        href={buildUrlWithQueryParams(
          '/signin/:social',
          {
            social: 'apple',
          },
          queryParams,
        )}
        data-cy="apple-sign-in-button"
        data-link-name="apple-social-button"
      >
        Apple
      </LinkButton>
    </div>
  );
};
