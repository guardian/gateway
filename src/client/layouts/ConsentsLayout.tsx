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
import {
  gridRow,
  gridItem,
  MAX_WIDTH,
  gridItemColumnConsents,
} from '@/client/styles/Grid';
import { from } from '@guardian/src-foundations/mq';

const consentsBackground = css`
  background-color: ${brand[800]};
`;

const mainBackground = css`
  background-color: white;
  position: relative;
  z-index: 0;
  &:before {
    content: ' ';
    background-color: ${brand[800]};
    opacity: 0.3;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }
`;

const blueBorder = css`
  margin 0 auto;
  
  ${from.tablet} {
    border-left: 1px solid ${brand[400]};
    border-right: 1px solid ${brand[400]};
  }
`;

const content = css`
  ${gridRow}
  background-color: white;
  width: 100%;
  padding-top: ${space[5]}px;
  padding-bottom: ${space[3]}px;
  ${blueBorder}
`;

const controls = css`
  padding: ${space[9]}px 0 ${space[24]}px 0;
`;

const h1 = css`
  color: ${brand[400]};
  margin: ${space[4]}px 0 ${space[12]}px 0;
  ${titlepiece.small({ fontWeight: 'bold' })};
  ${gridItem(gridItemColumnConsents)}
`;

const h2 = css`
  color: ${brand[100]};
  margin: ${space[4]}px 0 ${space[3]}px 0;
  ${textSans.large()}
  ${gridItem(gridItemColumnConsents)}
`;

const lines = css`
  ${blueBorder}
  ${from.tablet} {
    max-width: ${MAX_WIDTH.TABLET}px;
  }
`;

export const ConsentsLayout: FunctionComponent = (props) => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { error } = globalState;

  return (
    <>
      <Header />
      {error && <GlobalError error={error} />}
      <div css={consentsBackground}>
        <div css={[gridRow, blueBorder]}>
          <h2 css={h2}>Your registration</h2>
        </div>
        <Lines n={3} color={brand[400]} cssOverrides={lines} />
        <div css={[gridRow, blueBorder]}>
          <h1 css={h1}>Your data</h1>
        </div>
      </div>
      <main css={mainBackground}>
        <div css={content}>
          <div css={gridItem(gridItemColumnConsents)}>
            <PageProgression />
          </div>
          {props.children}
        </div>
      </main>
      <div css={consentsBackground}>
        <div css={[gridRow, blueBorder]}>
          <div css={[gridItem(gridItemColumnConsents), controls]}>
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
