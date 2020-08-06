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
import { PageProgression } from '../components/PageProgression';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { GridRow, GridItem } from '@guardian/src-grid';
import {
  mainGridRow,
  gridRowBreakpoints,
  gridItemSpansFullWidth,
} from '../styles/Shared';

const gridRow = css`
  background-color: ${brand[800]};
  margin: 0 auto;
`;

const main = css`
  background-color: ${brand[800]};
`;

const controls = css`
  padding: ${space[9]}px 0 ${space[24]}px;
`;

const h1 = css`
  color: ${brand[400]};
  margin: ${space[4]}px 0 ${space[12]}px 0;
  ${titlepiece.small({ fontWeight: 'bold' })}
`;

const h2 = css`
  color: ${brand[100]};
  margin: ${space[4]}px 0 ${space[3]}px 0;
  ${textSans.large()}
`;

export const ConsentsLayout: FunctionComponent = (props) => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { error } = globalState;

  return (
    <>
      <Header />
      {error && <GlobalError error={error} />}
      <div>
        <GridRow cssOverrides={gridRow} breakpoints={gridRowBreakpoints}>
          <GridItem spans={gridItemSpansFullWidth}>
            <h2 css={h2}>Your registration</h2>
            <Lines n={3} color={brand[400]} />
            <h1 css={h1}>Your data</h1>
          </GridItem>
        </GridRow>
      </div>
      <main css={main}>
        <GridRow cssOverrides={mainGridRow} breakpoints={gridRowBreakpoints}>
          <GridItem spans={gridItemSpansFullWidth}>
            <PageProgression />
          </GridItem>
        </GridRow>

        {props.children}
      </main>
      <div>
        <GridRow breakpoints={gridRowBreakpoints} cssOverrides={gridRow}>
          <GridItem spans={gridItemSpansFullWidth} cssOverrides={controls}>
            <Button
              iconSide="right"
              nudgeIcon={true}
              icon={<SvgArrowRightStraight />}
            >
              Continue
            </Button>
          </GridItem>
        </GridRow>
      </div>
      <Footer />
    </>
  );
};
