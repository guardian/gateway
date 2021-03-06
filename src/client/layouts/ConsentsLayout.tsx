import React, { useContext, FunctionComponent } from 'react';
import { Footer } from '@/client/components/Footer';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { css } from '@emotion/react';
import { brand, space } from '@guardian/src-foundations';
import { Button, LinkButton } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import {
  getAutoRow,
  gridItem,
  gridItemColumnConsents,
} from '@/client/styles/Grid';
import { controls } from '@/client/layouts/shared/Consents';
import { ConsentsSubHeader } from '@/client/components/ConsentsSubHeader';
import { ConsentsBlueBackground } from '@/client/components/ConsentsBlueBackground';
import { ConsentsHeader } from '@/client/components/ConsentsHeader';
import { Routes } from '@/shared/model/Routes';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { CsrfFormField } from '@/client/components/CsrfFormField';

interface ConsentsLayoutProps {
  children?: React.ReactNode;
  current?: string;
  title: string;
  bgColor?: string;
}

const mainBackground = css`
  position: relative;
  z-index: 0;
  &:before {
    content: ' ';
    background-color: ${brand[400]};
    opacity: 0.8;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }
`;

const form = css`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
`;

// fixes overlapping text issue in IE
// derived from this solution https://stackoverflow.com/a/49368815
const ieFlexFix = css`
  flex: 0 0 auto;
`;

const mainStyles = css`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
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
      <main css={mainStyles}>
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
