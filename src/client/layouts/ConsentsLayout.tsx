import React, { useContext, FunctionComponent } from 'react';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { GlobalError } from '@/client/components/GlobalError';
import { brand } from '@guardian/src-foundations/palette';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { MaxWidth } from '@/client/models/Style';
import { Lines } from '@/client/components/Lines';
import { PageProgression } from '../components/PageProgression';

const main = css`
  background-color: white;
  flex: 1 1 auto;
  padding: ${space[6]}px ${space[3]}px;
  max-width: ${MaxWidth.TABLET}px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: left;
`;

export const ConsentsLayout: FunctionComponent = (props) => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { error } = globalState;

  return (
    <>
      <Header />
      {error && <GlobalError error={error} />}
      <h2>Your registration</h2>
      <Lines n={3} color={brand[400]} />
      <h1>Your data</h1>
      <main css={main}>
        <PageProgression />
        {props.children}
      </main>
      <Footer />
    </>
  );
};
