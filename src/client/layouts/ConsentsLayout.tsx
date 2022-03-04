import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { from, neutral, space, until } from '@guardian/source-foundations';

import { Footer } from '@/client/components/Footer';
import useClientState from '@/client/lib/hooks/useClientState';
import {
  getAutoRow,
  gridItemColumnConsents,
  gridRow,
} from '@/client/styles/Grid';
import { ConsentsSubHeader } from '@/client/components/ConsentsSubHeader';
import { ConsentsHeader } from '@/client/components/ConsentsHeader';

interface ConsentsLayoutProps {
  current?: string;
  title: string;
  showContinueButton?: boolean;
}

export const mainStyles = css`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${neutral[86]};
    border-right: 1px solid ${neutral[86]};
  }

  ${until.tablet} {
    width: 100%;
  }
`;

export const controls = css`
  padding: 22px 0 64px;
  ${from.tablet} {
    padding-bottom: ${space[24]}px;
  }
`;

export const ConsentsLayout: FunctionComponent<ConsentsLayoutProps> = ({
  children,
  current,
  title,
}) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const clientState = useClientState();
  const { pageData = {}, globalMessage: { error, success } = {} } = clientState;
  const { geolocation } = pageData;

  return (
    <>
      <ConsentsHeader
        error={error}
        success={success}
        geolocation={geolocation}
      />
      <main css={mainStyles}>
        <ConsentsSubHeader autoRow={autoRow} title={title} current={current} />
        {children && <section css={gridRow}>{children}</section>}
      </main>
      <Footer />
    </>
  );
};
