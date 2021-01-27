import React, { useContext, FunctionComponent } from 'react';
import { NavBar } from '@/client/components/NavBar';
import { Footer } from '@/client/components/Footer';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { GlobalError } from '@/client/components/GlobalError';
import { getErrorLink } from '@/client/lib/ErrorLink';
import { css } from '@emotion/react';
import { brand, space } from '@guardian/src-foundations';
import { Button, LinkButton } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import {
  gridItem,
  gridItemColumnConsents,
  gridRow,
} from '@/client/styles/Grid';
import {
  ConsentsContent,
  ConsentsBlueBackground,
  ieFlexFix,
  mainBackground,
  controls,
  main,
  CONSENTS_MAIN_COLOR,
} from '@/client/layouts/shared/Consents';
import { Routes } from '@/shared/model/Routes';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { maxWidth } from '../styles/Shared';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { from } from '@guardian/src-foundations/mq';
import { titlepiece } from '@guardian/src-foundations/typography';
import { CONSENTS_PAGES_ARR } from '../models/ConsentsPages';
import { PageProgression } from '../components/PageProgression';

interface ConsentsLayoutProps {
  children?: React.ReactNode;
  current?: string;
  title: string;
}

const form = css`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
`;

const linkButton = css`
  margin-left: ${space[5]}px;
`;

const header = css`
  ${maxWidth}
  margin: 0 auto;
  padding-right: 0;
`;

const headerContainer = css`
  background-color: ${brand[400]};
`;

const content = css`
  padding-left: 0;
  padding-right: 0;
  padding-top: 0;
`;

const consentsBackground = css`
  background-color: ${CONSENTS_MAIN_COLOR};
`;

const blueBorder = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${brand[400]};
    border-right: 1px solid ${brand[400]};
  }
`;

const h1 = css`
  color: ${brand[400]};
  margin: ${space[4]}px 0 ${space[5]}px 0;
  ${titlepiece.small({ fontWeight: 'bold' })};
  ${gridItem(gridItemColumnConsents)};
  line-height: 1;
`;

const pageProgression = css`
  margin-top: ${space[5]}px;
  margin-bottom: 0;
  ${gridItem(gridItemColumnConsents)};
`;

export const ConsentsLayoutABVariant: FunctionComponent<ConsentsLayoutProps> = ({
  children,
  current,
}) => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, globalMessage: { error, success } = {} } = clientState;
  const { page = '', previousPage, returnUrl } = pageData;
  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';
  return (
    <>
      <div css={headerContainer}>
        <NavBar cssOverrides={header} />
        {error && <GlobalError error={error} link={getErrorLink(error)} left />}
        {success && <GlobalSuccess success={success} />}
      </div>
      <header css={consentsBackground}>
        <div css={[gridRow, blueBorder]}>
          <PageProgression
            cssOverrides={pageProgression}
            pages={CONSENTS_PAGES_ARR}
            current={current}
          />
          <h1 css={h1}>Welcome, thank you for registering</h1>
        </div>
      </header>
      <form
        css={form}
        action={`${Routes.CONSENTS}/${page}${returnUrlQuery}`}
        method="post"
        onSubmit={({ target: form }) => {
          onboardingFormSubmitOphanTracking(
            page,
            pageData,
            // have to explicitly type as HTMLFormElement as typescript can't infer type of the event.target
            form as HTMLFormElement,
          );
        }}
      >
        <CsrfFormField />

        <main css={main}>
          <div css={[mainBackground, ieFlexFix]}>
            <ConsentsContent cssOverrides={content}>{children}</ConsentsContent>
          </div>
          <ConsentsBlueBackground>
            <div css={[gridItem(gridItemColumnConsents), controls]}>
              {!error && (
                <Button
                  iconSide="right"
                  nudgeIcon={true}
                  icon={<SvgArrowRightStraight />}
                  type="submit"
                >
                  Save and continue
                </Button>
              )}
              {previousPage && (
                <LinkButton
                  css={linkButton}
                  href={`${Routes.CONSENTS}/${previousPage}${returnUrlQuery}`}
                  priority="subdued"
                >
                  Go back
                </LinkButton>
              )}
            </div>
          </ConsentsBlueBackground>
        </main>
      </form>
      <Footer />
    </>
  );
};
