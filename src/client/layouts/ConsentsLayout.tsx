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
import { Lines } from '@/client/components/Lines';
import { PageProgression } from '@/client/components/PageProgression';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { gridRow, gridItem } from '@/client/styles/Grid';

const pageHead = css`
  background-color: ${brand[800]};
`;

const main = css`
  ${gridRow}
  background-color: white;
  width: 100%;
  padding-top: ${space[5]}px;
  padding-bottom: ${space[3]}px;
`;

const controls = css`
  background-color: ${brand[800]};
  padding: ${space[9]}px 0 ${space[24]}px 0;
`;

const h1 = css`
  color: ${brand[400]};
  margin: ${space[4]}px 0 ${space[12]}px 0;
  ${titlepiece.small({ fontWeight: 'bold' })};
  ${gridItem()}
`;

const h2 = css`
  color: ${brand[100]};
  margin: ${space[4]}px 0 ${space[3]}px 0;
  ${textSans.large()}
  ${gridItem()}
`;

export const ConsentsLayout: FunctionComponent = (props) => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { error } = globalState;

  return (
    <>
      <Header />
      {error && <GlobalError error={error} />}
      <div css={pageHead}>
        <div css={gridRow}>
          <h2 css={h2}>Your registration</h2>
        </div>
        <Lines n={3} color={brand[400]} />
        <div css={gridRow}>
          <h1 css={h1}>Your data</h1>
        </div>
      </div>
      <main css={main}>
        <div css={gridItem()}>
          <PageProgression />
        </div>
        {props.children}
      </main>
      <div css={controls}>
        <div css={gridRow}>
          <div css={gridItem()}>
            <Button
              iconSide="right"
              nudgeIcon={true}
              icon={<SvgArrowRightStraight />}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
