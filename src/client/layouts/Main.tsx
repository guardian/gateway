import React, { PropsWithChildren, useContext } from 'react';
import { css } from '@emotion/react';
import { from } from '@guardian/src-foundations/mq';
import { neutral, space } from '@guardian/src-foundations';
import { headline } from '@guardian/src-foundations/typography';
import {
  ErrorSummary,
  SuccessSummary,
} from '@guardian/source-react-components-development-kitchen';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { ClientStateContext } from '@/client/components/ClientState';
import { ClientState } from '@/shared/model/ClientState';

interface MainLayoutProps {
  pageTitle?: string;
  successOverride?: string;
  errorOverride?: string;
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

const headerStyles = (hasSummary = false) => css`
  /* padding */
  padding-top: ${space[6]}px;
  padding-bottom: ${space[6]}px;

  ${hasSummary &&
  css`
    padding-top: 0;
  `}

  ${from.desktop} {
    ${hasSummary
      ? css`
          padding-top: 0;
        `
      : css`
          padding-top: ${space[9]}px;
        `}
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

const summaryStyles = css`
  margin: ${space[6]}px 0;
`;

export const MainLayout = ({
  children,
  pageTitle,
  successOverride,
  errorOverride,
}: PropsWithChildren<MainLayoutProps>) => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {} } = clientState;

  const successMessage = successOverride || success;
  const errorMessage = errorOverride || error;

  return (
    <>
      <Header />
      <main css={[mainStyles, gridRow]}>
        <section css={gridItem(gridSpanDefinition)}>
          {errorMessage && (
            <ErrorSummary cssOverrides={summaryStyles} message={errorMessage} />
          )}
          {successMessage && !errorMessage && (
            <SuccessSummary
              cssOverrides={summaryStyles}
              message={successMessage}
            />
          )}
          {pageTitle && (
            <header css={headerStyles(!!(errorMessage || successMessage))}>
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
