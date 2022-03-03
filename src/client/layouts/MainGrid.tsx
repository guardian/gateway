import React from 'react';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { css } from '@emotion/react';
import useClientState from '@/client/lib/hooks/useClientState';
import { SubHeader } from '@/client/components/SubHeader';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { ErrorSummary } from '@guardian/source-react-components-development-kitchen';
import { from, space } from '@guardian/source-foundations';
import { topMargin } from '@/client/styles/Shared';

type Props = {
  subTitle?: string;
  successOverride?: string;
  errorOverride?: string;
  errorContext?: React.ReactNode | string;
  errorReportUrl?: string;
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
  errorContext,
  errorReportUrl,
  children,
  gridSpanDefinition,
}: Props) => {
  const clientState = useClientState();
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
              message={errorMessage}
              cssOverrides={errorSummaryMargin}
              errorReportUrl={errorReportUrl}
              context={errorContext}
            />
          )}
          {children}
        </section>
      </div>
    </main>
  );
};
