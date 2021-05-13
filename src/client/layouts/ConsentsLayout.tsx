import React, { useContext, FunctionComponent } from 'react';
import { Footer } from '@/client/components/Footer';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { Button, LinkButton } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import {
  getAutoRow,
  gridItem,
  gridItemColumnConsents,
} from '@/client/styles/Grid';
import {
  ConsentsBlueBackground,
  ieFlexFix,
  mainBackground,
  ConsentsHeader,
  ConsentsSubHeader,
  controls,
} from '@/client/layouts/shared/Consents';
import { Routes } from '@/shared/model/Routes';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { CsrfFormField } from '@/client/components/CsrfFormField';

interface ConsentsLayoutProps {
  children?: React.ReactNode;
  current?: string;
  title: string;
  bgColor?: string;
}

const form = css`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
`;

const linkButton = css`
  margin-left: ${space[5]}px;
`;

const sectionStyles = css`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`;

export const ConsentsLayout: FunctionComponent<ConsentsLayoutProps> = ({
  children,
  current,
  title,
  bgColor,
}) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, globalMessage: { error, success } = {} } = clientState;
  const { page = '', previousPage, returnUrl } = pageData;
  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';
  const optionalBgColor =
    bgColor &&
    css`
      &:before {
        background-color: ${bgColor};
        opacity: 0.4;
      }
    `;
  return (
    <>
      <ConsentsHeader error={error} success={success} />
      <main>
        <ConsentsSubHeader autoRow={autoRow} title={title} current={current} />
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

          <section css={sectionStyles}>
            <div css={[mainBackground, ieFlexFix, optionalBgColor]}>
              {children}
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
          </section>
        </form>
      </main>
      <Footer />
    </>
  );
};
