import React, { useContext, FunctionComponent } from 'react';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { GlobalError } from '@/client/components/GlobalError';
import { brand } from '@guardian/src-foundations/palette';
import { titlepiece, textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { MaxWidth } from '@/client/models/Style';
import { Lines } from '@/client/components/Lines';
import { PageProgression } from '../components/PageProgression';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';

const pageHead = css`
  background-color: ${brand[800]};
`;

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

const controls = css`
  background-color: ${brand[800]};
  padding: ${space[9]}px ${space[3]}px ${space[24]}px;
`;

const h1 = css`
  color: ${brand[400]};
  margin: ${space[4]}px 0 ${space[12]}px 0;
  padding: 0 ${space[3]}px;
  ${titlepiece.small({ fontWeight: 'bold' })}
`;

const h2 = css`
  color: ${brand[100]};
  margin: ${space[4]}px 0 ${space[3]}px 0;
  padding: 0 ${space[3]}px;
  ${textSans.large()}
`;

export const ConsentsLayout: FunctionComponent = (props) => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { error } = globalState;

  return (
    <>
      <Header />
      {error && <GlobalError error={error} />}
      <div css={pageHead}>
        <h2 css={h2}>Your registration</h2>
        <Lines n={3} color={brand[400]} />
        <h1 css={h1}>Your data</h1>
      </div>
      <main css={main}>
        <PageProgression />
        {props.children}
      </main>
      <div css={controls}>
        <Button
          iconSide="right"
          nudgeIcon={true}
          icon={<SvgArrowRightStraight />}
        >
          Continue
        </Button>
      </div>
      <Footer />
    </>
  );
};
