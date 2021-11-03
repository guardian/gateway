import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import { from } from '@guardian/src-foundations/mq';
import { neutral, space } from '@guardian/src-foundations';
import { headline } from '@guardian/src-foundations/typography';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';

interface MainLayoutProps {
  pageTitle?: string;
}

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

const headerStyles = css`
  /* padding */
  padding-top: ${space[6]}px;
  padding-bottom: ${space[6]}px;

  ${from.desktop} {
    padding-top: ${space[9]}px;
  }

  /* margin */
  margin-bottom: ${space[1]}px;

  /* border */
  border-bottom: 1px solid ${neutral[86]};
`;

const pageTitleStyles = css`
  width: 100%;
  margin: 0;

  ${headline.small({ fontWeight: 'bold' })}
  font-size: 28px;
  ${from.desktop} {
    font-size: 32px;
  }
`;

export const MainLayout = ({
  children,
  pageTitle,
}: PropsWithChildren<MainLayoutProps>) => {
  return (
    <>
      <Header />
      <main css={[mainStyles, gridRow]}>
        <section css={gridItem(gridSpanDefinition)}>
          {pageTitle && (
            <header css={headerStyles}>
              <h1 css={[pageTitleStyles]}>{pageTitle}</h1>
            </header>
          )}
          <div>{children}</div>
        </section>
      </main>
      <Footer />
    </>
  );
};
