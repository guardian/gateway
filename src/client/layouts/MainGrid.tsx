import React, { useContext } from 'react';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { SubHeader } from '@/client/components/SubHeader';
import { GlobalError } from '@/client/components/GlobalError';
import { getErrorLink } from '@/client/lib/ErrorLink';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';

type Props = {
  subTitle?: string;
  successOverride?: string;
  children: React.ReactNode;
  gridSpanDefinition?: SpanDefinition;
};

const mainStyle = css`
  margin: 0 auto;
`;

const sectionStyle = css`
  margin-top: ${space[2]}px;
  ${from.mobileMedium} {
    margin-top: ${space[4]}px;
  }
  ${from.tablet} {
    margin-top: ${space[6]}px;
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
    <main css={[gridRow, mainStyle]}>
      {subTitle && <SubHeader title={subTitle} />}
      {error && <GlobalError error={error} link={getErrorLink(error)} />}
      {successMessage && <GlobalSuccess success={successMessage} />}
      <section css={[sectionStyle, gridItem(gridSpanDefinition)]}>
        {children}
      </section>
    </main>
  );
};
