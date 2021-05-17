// ABTEST: followupConsent: This page is only used as part of the followupConsent abtest.
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
import React from 'react';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Footer } from '@/client/components/Footer';
import { GlobalError } from '@/client/components/GlobalError';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { SvgGuardianLogo } from '@guardian/src-brand';
import { getErrorLink } from '@/client/lib/ErrorLink';
import {
  getAutoRow,
  gridItemColumnConsents,
  gridRow,
  manualRow,
  MAX_WIDTH,
} from '@/client/styles/Grid';
import NEWSLETTER_PHONE_IMAGE from '@/client/assets/newsletter_phone.png';
import { NewsLetter } from '@/shared/model/Newsletter';
import { PageTitle } from '@/shared/model/PageTitle';
import { Consent } from '@/shared/model/Consent';
import { EntityType } from '@/shared/model/Entity';
import { Routes } from '@/shared/model/Routes';
import { EnvelopeImage } from '@/client/components/EnvelopeImage';

type ConsentsFollowUpProps = {
  returnUrl?: string;
  entity: NewsLetter | Consent;
  entityType: EntityType;
  error?: string;
  success?: string;
};

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
    span: 9,
  },
  WIDE: {
    start: 3,
    span: 9,
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

const navSpanDef = {
  ...gridItemColumnConsents,
  TABLET: {
    start: 10,
    span: 3,
  },
  DESKTOP: {
    start: 9,
    span: 4,
  },
  WIDE: {
    start: 12,
    span: 4,
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

const envelopeSpanDef = {
  ...imageSpanDef,
  DESKTOP: {
    start: 9,
    span: 2,
  },
  WIDE: {
    start: 12,
    span: 2,
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
    justify-self: end;
    height: 54px;
    fill: white;
    ${manualRow(1, navSpanDef)}
  }

  ${from.desktop} {
    & svg {
      height: 100px;
    }
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
    font-size: 39px;
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
  -ms-grid-column-align: center;
  ${from.desktop} {
    width: 255px;
    height: 314px;
    -ms-grid-row-align: end;
    margin-bottom: -50px;
  }
`;

const envelope = css`
  ${img}
  margin-bottom: -30px;
  overflow: hidden;
  ${from.desktop} {
    width: 218px;
    margin-bottom: 0;
    align-self: center;
  }
`;

const form = css`
  flex: 1 0;
`;

const newsletterCard = css`
  padding: 0 ${space[3]}px 30px ${space[3]}px;
  border-top: 1px solid ${BORDER_GREY};
  margin: 0 1px 1px;
  background-color: white;

  & h2 {
    ${headline.xsmall({ fontWeight: 'bold' })}
  }
  & p {
    ${body.medium()}
    border-top: 1px solid ${BORDER_GREY};
    margin-bottom: ${space[3]}px;
  }
  ${from.desktop} {
    border-top: 0;
    -ms-grid-row: 1;
    grid-row: 1;
    padding-left: 0;
    padding-right: 0;

    & h2 {
      ${headline.medium({ fontWeight: 'bold' })}
      margin-top: ${space[3]}px;
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

const decideTitle = (type: EntityType): string => {
  switch (type) {
    case 'newsletter':
      return PageTitle.NEWSLETTER_VARIANT;
    case 'consent':
      return PageTitle.CONSENT_VARIANT;
  }
};

const decideSubmitUrl = (type: EntityType, returnUrl?: string): string => {
  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';
  switch (type) {
    case 'newsletter':
      return `${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_NEWSLETTERS}${returnUrlQuery}`;
    case 'consent':
      return `${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_CONSENTS}${returnUrlQuery}`;
  }
};

export const ConsentsFollowUp = ({
  returnUrl,
  entity,
  entityType,
  error,
  success,
}: ConsentsFollowUpProps) => {
  const autoRow = getAutoRow(1, spanDef);
  const title = decideTitle(entityType);
  const submitUrl = decideSubmitUrl(entityType, returnUrl);

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
          <h1 css={[h1, autoRow()]}>{title}</h1>
        </Container>
      </div>
      <form action={submitUrl} method="post" css={form}>
        <div css={[gridRow, newsletterContainer]}>
          <div
            css={[
              manualRow(2, newsletterBackgroundSpanDef),
              newsletterBackground,
            ]}
          />
          {entityType === 'newsletter' ? (
            <img
              css={[img, manualRow(1, imageSpanDef)]}
              src={NEWSLETTER_PHONE_IMAGE}
              alt="Phone with newsletter displayed"
            />
          ) : (
            <></>
          )}
          {entityType === 'consent' ? (
            <EnvelopeImage
              cssOverrides={[img, envelope, manualRow(1, envelopeSpanDef)]}
              invertColors
            />
          ) : (
            <></>
          )}
          <div css={[newsletterCard, manualRow(2, newsletterSpanDef)]}>
            <h2>{entity.name}</h2>
            <p>{entity.description}</p>
            <CheckboxGroup
              name={entity.id}
              label={entity.name}
              hideLabel={true}
              cssOverrides={checkboxGroup}
            >
              {/* if the Checkbox is unchecked, this hidden empty value will be sent in form submit POST,
          to signal possible unsubscribe event */}
              <input type="hidden" name={entity.id} value="" />
              <Checkbox value={entity.id} label="Yes, sign me up" />
            </CheckboxGroup>
            <Button type="submit">Continue to The Guardian</Button>
          </div>
        </div>
        <CsrfFormField />
      </form>
      <Footer />
    </>
  );
};
