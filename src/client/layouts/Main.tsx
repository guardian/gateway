import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import { from } from '@guardian/src-foundations/mq';
import { neutral } from '@guardian/src-foundations';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MainLayoutProps {}

const mainStyles = css`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  margin: 0 auto;
  ${from.tablet} {
    border-left: 1px solid ${neutral[86]};
    border-right: 1px solid ${neutral[86]};
  }

  /* minimum height */
  min-height: 334px;
  ${from.mobileMedium} {
    min-height: 392px;
  }
  ${from.mobileLandscape} {
    min-height: 482px;
  }
  ${from.tablet} {
    min-height: 504px;
  }
  ${from.desktop} {
    min-height: 460px;
  }
`;

const gridSpanDefinition: SpanDefinition = {
  TABLET: { start: 1, span: 8 },
  DESKTOP: { start: 2, span: 6 },
  LEFT_COL: { start: 3, span: 6 },
  WIDE: { start: 4, span: 6 },
};

export const MainLayout = ({
  children,
}: PropsWithChildren<MainLayoutProps>) => {
  return (
    <>
      <Header />
      <main css={[mainStyles, gridRow]}>
        <section css={gridItem(gridSpanDefinition)}>
          <div>{children}</div>
        </section>
      </main>
      <Footer />
    </>
  );
};
