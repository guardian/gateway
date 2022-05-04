import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { from, space } from '@guardian/source-foundations';

import { Footer } from '@/client/components/Footer';
import useClientState from '@/client/lib/hooks/useClientState';
import {
  getAutoRow,
  gridItemColumnConsents,
  gridRow,
} from '@/client/styles/Grid';
import { greyBorderSides } from '@/client/styles/Consents';
import { ConsentsSubHeader } from '@/client/components/ConsentsSubHeader';
import { ConsentsHeader } from '@/client/components/ConsentsHeader';

interface ConsentsLayoutProps {
  current?: string;
  title: string;
  showContinueButton?: boolean;
}

const mainStyles = css`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`;

export const controls = css`
  padding: 22px 0 64px;
  ${from.tablet} {
    padding-bottom: ${space[24]}px;
  }
`;

// Ensures grey borders reach to bottom of page
const spacer = css`
  flex-grow: 1;
`;

export const ConsentsLayout: FunctionComponent<ConsentsLayoutProps> = ({
  children,
  current,
  title,
}) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const clientState = useClientState();
  const { globalMessage: { error, success } = {} } = clientState;

  return (
    <>
      <ConsentsHeader error={error} success={success} />
      <main css={mainStyles}>
        <ConsentsSubHeader autoRow={autoRow} title={title} current={current} />
        {children && (
          <section css={[gridRow, greyBorderSides]}>{children}</section>
        )}
        <div css={[spacer, gridRow, greyBorderSides]} />
      </main>
      <Footer />
    </>
  );
};
