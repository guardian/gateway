import React from 'react';
import { brand } from '@guardian/src-foundations/palette';
import { css } from '@emotion/react';
import { GlobalError } from '@/client/components/GlobalError';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { Header } from '@/client/components/Header';
import { getErrorLink } from '@/client/lib/ErrorLink';

type Props = {
  error?: string;
  success?: string;
};

const headerContainer = css`
  background-color: ${brand[400]};
`;

export const ConsentsHeader = ({ error, success }: Props) => (
  <div css={headerContainer}>
    <Header />
    {error && <GlobalError error={error} link={getErrorLink(error)} left />}
    {success && <GlobalSuccess success={success} />}
  </div>
);
