import React, { useContext } from 'react';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { css } from '@emotion/react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { SubHeader } from '@/client/components/SubHeader';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { ErrorSummary } from '@guardian/source-react-components-development-kitchen';
import { from } from '@guardian/src-foundations/mq';
import { topMargin } from '@/client/styles/Shared';
import { space } from '@guardian/src-foundations';

type Props = {
  subTitle?: string;
  successOverride?: string;
  errorOverride?: string;
  children: React.ReactNode;
  gridSpanDefinition?: SpanDefinition;
};

const mainStyle = css`
  display: flex;
  flex: 1 1 auto;
`;

const gridStyle = css`
  margin: 0 auto;
  ${from.tablet} {
    border-left: 1px solid #dcdcdc;
    border-right: 1px solid #dcdcdc;
  }
`;

// This extra margin is added to keep the error
// margin-top 24px above tablet and 20px below
// the margin-bottom is consistently 12px.
const errorSummaryMargin = css`
  margin-bottom: ${space[3]}px;
  margin-top: ${space[3]}px;
  ${from.mobileMedium} {
    margin-top: ${space[1]}px;
  }
  ${from.tablet} {
    margin-top: 0;
  }
`;

export const MainGrid = ({
  subTitle,
  successOverride,
  errorOverride,
  children,
  gridSpanDefinition,
}: Props) => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {} } = clientState;

  const successMessage = successOverride || success;
  const errorMessage = errorOverride || error;

  return (
    <main css={mainStyle}>
      <div css={[gridRow, gridStyle]}>
        {subTitle && <SubHeader title={subTitle} />}
        {successMessage && <GlobalSuccess success={successMessage} />}
        <section css={[gridItem(gridSpanDefinition), topMargin]}>
          {errorMessage && (
            <ErrorSummary
              error={errorMessage}
              cssOverrides={errorSummaryMargin}
            />
          )}
          {children}
        </section>
      </div>
    </main>
  );
};
