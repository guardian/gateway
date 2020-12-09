import React, { useContext, FunctionComponent } from 'react';
import { NavBar } from '@/client/components/NavBar';
import { Footer } from '@/client/components/Footer';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { GlobalError } from '@/client/components/GlobalError';
import { getErrorLink } from '@/client/lib/ErrorLink';
import { css } from '@emotion/core';
import { brand, space } from '@guardian/src-foundations';
import { Button, LinkButton } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { gridItem, gridItemColumnConsents } from '@/client/styles/Grid';
import {
  ConsentsHeader,
  ConsentsContent,
  ConsentsBlueBackground,
  ieFlexFix,
  ConsentsProgression,
  mainBackground,
  controls,
  main,
} from '@/client/layouts/shared/Consents';
import { Routes } from '@/shared/model/Routes';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { maxWidth } from '../styles/Shared';
import { CsrfFormField } from '@/client/components/CsrfFormField';

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

export const ConsentsLayout: FunctionComponent<ConsentsLayoutProps> = ({
  children,
  title,
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
      <ConsentsHeader title={title} />
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
            <ConsentsContent>
              <ConsentsProgression current={current} />
              {children}
            </ConsentsContent>
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
