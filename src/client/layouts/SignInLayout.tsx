import React, { useContext, FunctionComponent } from 'react';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { Titlepiece } from '@/client/components/Titlepiece';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { GlobalError } from '@/client/components/GlobalError';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { MaxWidth } from '@/client/models/Style';

const main = css`
  flex: 1 1 auto;
  padding: ${space[6]}px ${space[3]}px;
  max-width: ${MaxWidth.TABLET}px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: left;
`;

export const SignInLayout: FunctionComponent = (props) => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { error } = globalState;

  return (
    <>
      <Header />
      <Titlepiece />
      {error && <GlobalError error={error} />}
      <main css={main}>{props.children}</main>
      <Footer />
    </>
  );
};
