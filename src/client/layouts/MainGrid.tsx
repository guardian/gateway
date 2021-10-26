import React, { useContext } from 'react';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { css } from '@emotion/react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { SubHeader } from '@/client/components/SubHeader';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { ErrorSummary } from '@guardian/source-react-components-development-kitchen';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';

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

const errorMessageTopMargin = css`
  margin-top: ${space[5]}px;
  ${from.desktop} {
    margin-top: ${space[6]}px;
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
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {} } = clientState;

  const successMessage = successOverride || success;
  const errorMessage = errorOverride || error;

  return (
    <main css={mainStyle}>
      <div css={[gridRow, gridStyle]}>
        {subTitle && <SubHeader title={subTitle} />}
        {successMessage && <GlobalSuccess success={successMessage} />}
        <section css={gridItem(gridSpanDefinition)}>
          {errorMessage && (
            <ErrorSummary
              error={errorMessage}
              context={errorContext}
              cssOverrides={errorMessageTopMargin}
              errorReportUrl={errorReportUrl}
            />
          )}
          {children}
        </section>
      </div>
    </main>
  );
};
