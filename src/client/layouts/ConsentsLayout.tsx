import React, { useContext, FunctionComponent } from 'react';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { GlobalError } from '@/client/components/GlobalError';
import { getErrorLink } from '@/client/lib/ErrorLink';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
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
} from '@/client/layouts/shared/Consents';
import { Routes } from '@/shared/model/Routes';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';

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

export const ConsentsLayout: FunctionComponent<ConsentsLayoutProps> = ({
  children,
  title,
  current,
}) => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { error, pageData = {}, success } = globalState;
  const { page = '', previousPage, returnUrl } = pageData;
  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';
  return (
    <>
      <Header />
      {error && <GlobalError error={error} link={getErrorLink(error)} />}
      {success && <GlobalSuccess success={success} />}
      <ConsentsHeader title={title} />
      <form
        css={form}
        action={`${Routes.CONSENTS}/${page}${returnUrlQuery}`}
        method="post"
        onSubmit={(e) => {
          onboardingFormSubmitOphanTracking(page, pageData, e);
        }}
      >
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
              type="submit"
            >
              Save and continue
            </Button>
            {previousPage && (
              <LinkButton
                css={linkButton}
                href={`${Routes.CONSENTS}/${previousPage}${returnUrlQuery}`}
                priority="subdued"
              >
                Go Back
              </LinkButton>
            )}
          </div>
        </ConsentsBlueBackground>
      </form>
      <Footer />
    </>
  );
};
