import React, { useContext } from 'react';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { SubHeader } from '@/client/components/SubHeader';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { GlobalError } from '@/client/components/GlobalError';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { Breakpoints } from '@/client/models/Style';
import { getErrorLink } from '@/client/lib/ErrorLink';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';

type Props = {
  subTitle: string;
  children: React.ReactNode;
};

const main = css`
  flex: 1 0 auto;
  padding: ${space[6]}px ${space[3]}px;
  max-width: ${Breakpoints.TABLET}px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: left;
`;

export const Layout = ({ subTitle, children }: Props) => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {} } = clientState;

  return (
    <>
      <Header />
      <SubHeader title={subTitle} />
      {error && <GlobalError error={error} link={getErrorLink(error)} />}
      {success && <GlobalSuccess success={success} />}
      <main css={main}>{children}</main>
      <Footer />
    </>
  );
};
