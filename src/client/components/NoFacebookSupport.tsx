import React from 'react';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { Link } from '@guardian/source-react-components';
import { sendOphanInteractionEvent } from '@/client/lib/ophan';
import { MainBodyText } from '@/client/components/MainBodyText';
import { QueryParams } from '@/shared/model/QueryParams';
import { css } from '@emotion/react';
import { space } from '@guardian/source-foundations';

interface Props {
  queryParams: QueryParams;
}

const fontStyles = css`
  font-size: 14px;
`;

const styles = css`
  margin-top: ${space[4]}px;
`;

export const NoFacebookSupport = ({ queryParams }: Props) => (
  <MainBodyText
    cssOverrides={css`
      ${fontStyles};
      ${styles};
    `}
    noMargin
  >
    <b>We no longer support authentication with Facebook.</b> Please sign in
    above using the same email address as your Facebook account. If you
    don&apos;t have a Guardian password, please{' '}
    <Link
      cssOverrides={fontStyles}
      href={buildUrlWithQueryParams('/reset-password', {}, queryParams)}
      onClick={() => {
        sendOphanInteractionEvent({
          component: 'facebook-password-reset-link',
          value: 'click',
        });
      }}
    >
      reset your password
    </Link>
    .
  </MainBodyText>
);
