import React, { useContext, FunctionComponent } from 'react';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { GlobalError } from '@/client/components/GlobalError';
import { brand } from '@guardian/src-foundations/palette';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { gridItem, gridItemColumnConsents } from '@/client/styles/Grid';
import {
  ConsentsHeader,
  ConsentsContent,
  ConsentsBlueBackground,
  ieFlexFix,
  ConsentsProgression,
} from '@/client/layouts/shared/Consents';

interface ConsentsLayoutProps {
  children?: React.ReactNode;
  current?: string;
  title: string;
}

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

const controls = css`
  padding: ${space[9]}px 0 ${space[24]}px 0;
`;

export const ConsentsLayout: FunctionComponent<ConsentsLayoutProps> = ({
  children,
  title,
  current,
}) => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { error } = globalState;

  return (
    <>
      <Header />
      {error && <GlobalError error={error} />}
      <ConsentsHeader title={title} />
      <main css={[mainBackground, ieFlexFix]}>
        <ConsentsContent>
          <ConsentsProgression current={current} />
          {children}
        </ConsentsContent>
      </main>
      <ConsentsBlueBackground>
        <div css={[gridItem(gridItemColumnConsents), controls]}>
          <Button
            iconSide="right"
            nudgeIcon={true}
            icon={<SvgArrowRightStraight />}
          >
            Continue
          </Button>
        </div>
      </ConsentsBlueBackground>
      <Footer />
    </>
  );
};
