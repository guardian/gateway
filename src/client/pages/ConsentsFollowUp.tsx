// ABTEST: followupConsent: This page is only used as part of the followupConsent abtest.
import { ClientState } from '@/shared/model/ClientState';
import { Routes } from '@/shared/model/Routes';
import { css } from '@emotion/react';
import { Button } from '@guardian/src-button';
import { Checkbox, CheckboxGroup } from '@guardian/src-checkbox';
import { brand, space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import {
  body,
  headline,
  titlepiece,
} from '@guardian/src-foundations/typography';
import { Container } from '@guardian/src-layout';
import React, { useContext } from 'react';
import { ClientStateContext } from '../components/ClientState';
import { CsrfFormField } from '../components/CsrfFormField';
import { Footer } from '../components/Footer';
import { GlobalError } from '../components/GlobalError';
import { GlobalSuccess } from '../components/GlobalSuccess';
import { SvgGuardianLogo } from '@guardian/src-brand';
import { getErrorLink } from '../lib/ErrorLink';
import {
  getAutoRow,
  gridItemColumnConsents,
  gridRow,
  manualRow,
  MAX_WIDTH,
} from '../styles/Grid';
import NEWSLETTER_PHONE_IMAGE from '@/client/assets/newsletter_phone.png';
import { NewsLetter } from '@/shared/model/Newsletter';
import { Consent } from '@/shared/model/Consent';

const GUARDIAN_BRAND = brand[400];
const ELECTION_BEIGE = '#DDDBD1';
const BORDER_GREY = '#DCDCDC';
const NEWSLETTER_CONTAINER_BGCOLOR = 'white';

const spanDef = {
  ...gridItemColumnConsents,
  TABLET: {
    start: 1,
    span: 12,
  },
  DESKTOP: {
    start: 2,
    span: 8,
  },
  WIDE: {
    start: 3,
    span: 8,
  },
};

const newsletterSpanDef = {
  ...gridItemColumnConsents,
  TABLET: {
    start: 1,
    span: 12,
  },
  DESKTOP: {
    start: 2,
    span: 6,
  },
  WIDE: {
    start: 3,
    span: 7,
  },
};

const imageSpanDef = {
  MOBILE: {
    start: 1,
    span: 4,
  },
  TABLET: {
    start: 1,
    span: 12,
  },
  DESKTOP: {
    start: 9,
    span: 3,
  },
  WIDE: {
    start: 12,
    span: 3,
  },
};

const newsletterBackgroundSpanDef = {
  ...gridItemColumnConsents,
  TABLET: {
    start: 1,
    span: 12,
  },
  DESKTOP: {
    start: 1,
    span: 12,
  },
  WIDE: {
    start: 2,
    span: 14,
  },
};

const nav = css`
  background-color: ${brand[400]};
  height: 70px;
  margin: 0 auto;
  padding-top: ${space[2]}px;
  padding-bottom: ${space[2]}px;
  & svg {
    justify-self: right;
    height: 100%;
    fill: white;
    ${manualRow(1, newsletterBackgroundSpanDef)}
  }

  ${from.desktop} {
    height: 116px;
    padding-top: ${space[3]}px;
    padding-bottom: ${space[3]}px;
  }
`;

const headerContainer = css`
  background-color: ${GUARDIAN_BRAND};
  border-bottom: 1px solid ${ELECTION_BEIGE};
`;

const h1 = css`
  color: white;
  ${titlepiece.small()};
  font-size: 34px;
  margin-top: 60px;
  margin-bottom: 75px;
  ${from.tablet} {
    font-size: 47px;
  }
  ${from.desktop} {
    ${titlepiece.large()};
    margin-bottom: 132px;
  }
`;

const titleContainer = css`
  background-color: ${GUARDIAN_BRAND};
`;

const img = css`
  width: 218px;
  height: auto;
  display: block;
  justify-self: center;
  margin-top: 48px;
  align-self: end;
  ${from.desktop} {
    width: 255px;
    margin-top: 0;
    margin-bottom: -50px;
  }
`;

const form = css`
  flex: 1 0;
`;

const newsletterCard = css`
  padding: 0 ${space[3]}px 30px ${space[3]}px;
  border-top: 1px solid ${BORDER_GREY};

  & h2 {
    ${headline.xsmall({ fontWeight: 'bold' })}
  }
  & p {
    ${body.medium()}
    border-top: 1px solid ${BORDER_GREY};
    margin-bottom: 2px;
  }
  ${from.desktop} {
    border-top: 0;
    -ms-grid-row: 1;
    grid-row: 1;
    padding-left: 0;
    padding-right: 0;

    & h2 {
      ${headline.medium({ fontWeight: 'bold' })}
      margin-top: ${space[1]}px;
      margin-bottom: ${space[9]}px;
    }

    & p {
      font-size: 20px;
    }
  }
`;

const checkboxGroup = css`
  margin-bottom: ${space[6]}px;
`;

const newsletterContainer = css`
  margin-top: -40px;
  margin-bottom: 70px;
  overflow: hidden;
  ${from.tablet} {
    margin-left: auto;
    margin-right: auto;
    max-width: ${MAX_WIDTH.TABLET}px;
  }
  ${from.desktop} {
    margin-top: -70px;
    max-width: ${MAX_WIDTH.DESKTOP}px;
  }
  ${from.wide} {
    max-width: ${MAX_WIDTH.WIDE}px;
  }
`;

const newsletterBackground = css`
  background-color: ${NEWSLETTER_CONTAINER_BGCOLOR};
  border: 1px solid ${BORDER_GREY};
  -ms-grid-row: 1;
  grid-row: 1 / span 2;
  ${from.desktop} {
    -ms-grid-row: 1;
    grid-row: 1;
  }
`;

function getEntities(clientState: ClientState) {
  const newsletters = clientState?.pageData?.newsletters;
  if (newsletters) {
    return newsletters;
  }
  const consents = clientState?.pageData?.consents;
  if (consents) {
    return consents;
  }
  return [];
}

function getPostAction(clientState: ClientState): string {
  const newsletters = clientState?.pageData?.newsletters;
  if (newsletters) {
    return `${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_NEWSLETTERS}`;
  }
  const consents = clientState?.pageData?.consents;
  if (consents) {
    return `${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_CONSENTS}`;
  }
  return '';
}

export const ConsentsFollowUp = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {}, pageData = {} } = clientState;
  const { returnUrl } = pageData;
  const entities = getEntities(clientState);
  const autoRow = getAutoRow(1, spanDef);
  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';
  return (
    <>
      <div css={[headerContainer]}>
        <nav css={[gridRow, nav]}>
          <SvgGuardianLogo />
        </nav>
        {error && <GlobalError error={error} link={getErrorLink(error)} left />}
        {success && <GlobalSuccess success={success} />}
      </div>
      <div css={titleContainer}>
        <Container cssOverrides={gridRow}>
          <h1 css={[h1, autoRow()]}>Get the headlines in your inbox</h1>
        </Container>
      </div>
      <form
        action={`${getPostAction(clientState)}${returnUrlQuery}`}
        method="post"
        css={form}
      >
        <div css={[gridRow, newsletterContainer]}>
          <div
            css={[
              manualRow(2, newsletterBackgroundSpanDef),
              newsletterBackground,
            ]}
          />
          <img
            css={[img, manualRow(1, imageSpanDef)]}
            src={NEWSLETTER_PHONE_IMAGE}
            alt="Phone with newsletter displayed"
          />
          {entities.map((entity: NewsLetter | Consent, i: number) => (
            <div
              key={i}
              css={[newsletterCard, manualRow(2, newsletterSpanDef)]}
            >
              <h2>{entity.name}</h2>
              <p>{entity.description}</p>
              <CheckboxGroup
                name={entity.id}
                label={entity.name}
                hideLabel={true}
                cssOverrides={checkboxGroup}
              >
                <Checkbox value={entity.id} label="Yes, sign me up" />
              </CheckboxGroup>
              <Button type="submit">Continue to The Guardian</Button>
            </div>
          ))}
        </div>
        <CsrfFormField />
      </form>
      <Footer />
    </>
  );
};
