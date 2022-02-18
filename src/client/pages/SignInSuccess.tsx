import React, { useContext } from 'react';
import { css } from '@emotion/react';
import {
  body,
  brand,
  from,
  headline,
  neutral,
  space,
  titlepiece,
  until,
} from '@guardian/source-foundations';
import { Button, Checkbox } from '@guardian/source-react-components';

import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { GeoLocation } from '@/shared/model/Geolocation';
import { Consent } from '@/shared/model/Consent';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import {
  gridItem,
  gridRow,
  gridRowPadding,
  innerGridRow,
} from '@/client/styles/Grid';
import { EnvelopeImage } from '@/client/components/EnvelopeImage';

const titleSpanDefinition = {
  DESKTOP: { start: 2, span: 10 },
  LEFT_COL: { start: 2, span: 11 },
  WIDE: { start: 2, span: 11 },
};

const envelopeSpanDefinition = {
  DESKTOP: { start: 9, span: 3 },
  LEFT_COL: { start: 11, span: 3 },
  WIDE: { start: 13, span: 3 },
};

const formSpanDefinition = {
  DESKTOP: { start: 2, span: 6 },
  LEFT_COL: { start: 2, span: 6 },
  WIDE: { start: 2, span: 6 },
};

const titleWrapper = css`
  background: ${brand[400]};
  border-top: 1px solid ${brand[600]};

  ${from.desktop} {
    border-top: none;
    margin-top: 1px;
  }
`;

const autoMargin = css`
  margin: 0 auto;
`;

const title = css`
  ${titlepiece.small()}
  ${gridItem(titleSpanDefinition)}
  font-size: 36px;
  color: ${neutral[100]};
  margin: 60px 0 70px;

  ${from.desktop} {
    ${titlepiece.large()}
    margin: 60px 0 130px;
  }
`;

const formStyles = css`
  ${gridItem(formSpanDefinition)}

  ${until.desktop} {
    padding: 0 ${space[5]}px;
  }
`;

const formBackground = css`
  background: ${neutral[97]};
  flex-grow: 1;
`;

const formWrapper = css`
  background: ${neutral[100]};
  border: 1px solid ${neutral[86]};
  position: relative;
  top: -${space[12]}px;

  ${from.desktop} {
    top: -72px;
  }
`;

const formGridRow = css`
  padding-bottom: 30px;

  ${until.desktop} {
    display: block;
  }
`;

const consentTitle = css`
  ${headline.xsmall({ fontWeight: 'bold' })}
  margin: ${space[1]}px 0 ${space[9]}px;

  ${from.desktop} {
    ${headline.medium({ fontWeight: 'bold' })}
  }
`;

const consentDescription = css`
  ${body.medium()}
  position: relative;

  &::before {
    display: block;
    content: '';
    width: 100%;
    height: 1px;
    background: ${neutral[86]};
  }

  ${from.desktop} {
    font-size: 20px;

    &::after {
      display: block;
      content: '';
      position: absolute;
      top: 0;
      right: 100%;
      width: 80px;
      height: 1px;
      background: ${neutral[86]};
    }
  }
`;

const envelopeImageWrapper = css`
  ${gridItem(envelopeSpanDefinition)}
  display: flex;
  justify-content: center;

  ${until.desktop} {
    padding-top: 52px;
    border-bottom: 1px solid ${neutral[86]};
    overflow: hidden;
  }

  ${from.desktop} {
    order: 2;
  }
`;

const envelopeImage = css`
  width: 220px;
  margin-bottom: -26px;
`;

const button = css`
  margin-top: ${space[4]}px;
`;

type SignInSuccessProps = {
  geolocation?: GeoLocation;
  consents: Consent[];
};

export const SignInSuccess = ({ consents }: SignInSuccessProps) => {
  const { id, name, description, consented } = consents[0];
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, queryParams } = clientState;
  const { page = '', geolocation } = pageData;
  const renderForm = () => (
    <form
      css={formStyles}
      action={buildUrlWithQueryParams('/signin/success', {}, queryParams)}
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
      <h2 css={consentTitle}>{name}</h2>
      <p css={consentDescription}>{description}</p>
      <Checkbox
        name={id}
        value={id}
        label="Yes, sign me up"
        defaultChecked={!!consented}
      />
      <Button type="submit" cssOverrides={button}>
        Continue to The Guardian
      </Button>
    </form>
  );

  return (
    <>
      <Header geolocation={geolocation} />
      <main>
        <div css={titleWrapper}>
          <div css={[autoMargin, gridRow]}>
            <h1 css={title}>Get the latest offers sent to your inbox</h1>
          </div>
        </div>
        <div css={formBackground}>
          <div css={[autoMargin, gridRowPadding]}>
            <div css={formWrapper}>
              <div css={[innerGridRow, formGridRow]}>
                <div css={envelopeImageWrapper}>
                  <EnvelopeImage invertColors cssOverrides={envelopeImage} />
                </div>
                {renderForm()}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
