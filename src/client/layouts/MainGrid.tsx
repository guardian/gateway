import React, { useContext } from 'react';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { css } from '@emotion/react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { SubHeader } from '@/client/components/SubHeader';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { ErrorSummary } from '@guardian/source-react-components-development-kitchen';
import { topMargin } from '@/client/styles/Shared';
import { from } from '@guardian/src-foundations/mq';

type Props = {
  subTitle?: string;
  successOverride?: string;
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

export const MainGrid = ({
  subTitle,
  successOverride,
  children,
  gridSpanDefinition,
}: Props) => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {} } = clientState;

  const successMessage = success || successOverride;

  return (
    <main css={mainStyle}>
      <div css={[gridRow, gridStyle]}>
        {subTitle && <SubHeader title={subTitle} />}
        {successMessage && <GlobalSuccess success={successMessage} />}
        <section css={gridItem(gridSpanDefinition)}>
          {error && <ErrorSummary error={error} cssOverrides={topMargin} />}
          {children}
        </section>
      </div>
    </main>
  );
};
