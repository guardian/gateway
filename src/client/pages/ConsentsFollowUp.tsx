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
import { NavBar } from '../components/NavBar';
import { getErrorLink } from '../lib/ErrorLink';
import {
  getAutoRow,
  gridItemColumnConsents,
  gridRow,
  manualRow,
} from '../styles/Grid';
import { maxWidth } from '../styles/Shared';

const GUARDIAN_BRAND = brand[400];
const ELECTION_BEIGE = '#DDDBD1';
const BORDER_GREY = '#DCDCDC';
const MARGIN_OFFSET_PX = 40;
const NEWSLETTER_CONTAINER_BGCOLOR = 'white';

const header = css`
  ${maxWidth}
  margin: 0 auto;
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
  margin-bottom: ${MARGIN_OFFSET_PX + 28}px;
  ${from.tablet} {
    ${titlepiece.large()};
  }
`;

const titleContainer = css`
  background-color: ${GUARDIAN_BRAND};
`;

const img = css`
  background-color: firebrick; /* TODO: REMOVE */
  width: 218px;
  height: 435px; /* TODO: auto this when asset secured (Also in MQ section) */
  margin-bottom: -165px;
  display: block;
  justify-self: center;
  ${from.tablet} {
    width: 255px;
    height: 512px;
  }
  ${from.desktop} {
    margin-top: 80px;
    margin-bottom: -221px;
  }
`;

const newsletterCard = css`
  padding: 0 ${space[3]}px 30px ${space[3]}px;
  border-top: 1px solid ${BORDER_GREY};
  background-color: ${NEWSLETTER_CONTAINER_BGCOLOR};
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
  }
`;

const checkboxGroup = css`
  margin-bottom: ${space[6]}px;
`;

const newsletterContainer = css`
  background-color: ${NEWSLETTER_CONTAINER_BGCOLOR};
  border: 1px solid ${BORDER_GREY};
  margin: 0 12px; /* TODO: Bring this in from the span def? */
  margin-top: -${MARGIN_OFFSET_PX}px;
  margin-bottom: 70px;
`;

const containerGeneral = css`
  padding-left: 0;
  padding-right: 0;
  overflow: hidden;
`;

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
    span: 5,
  },
  WIDE: {
    start: 3,
    span: 5,
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
    start: 8,
    span: 4,
  },
  WIDE: {
    start: 11,
    span: 5,
  },
};

export const ConsentsFollowUp = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {} } = clientState;
  const newsletters = clientState?.pageData?.newsletters ?? [];
  const autoRow = getAutoRow(1, spanDef);
  return (
    <>
      <div css={headerContainer}>
        <NavBar cssOverrides={header} />
        {error && <GlobalError error={error} link={getErrorLink(error)} left />}
        {success && <GlobalSuccess success={success} />}
      </div>
      <div css={titleContainer}>
        <Container cssOverrides={gridRow}>
          <h1 css={[h1, autoRow()]}>Get the headlines in your inbox</h1>
        </Container>
      </div>
      <form
        action={`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP}`}
        method="post"
      >
        <div css={newsletterContainer}>
          <Container cssOverrides={[gridRow, containerGeneral]}>
            <img
              css={[img, manualRow(1, imageSpanDef)]}
              alt="Phone with newsletter displayed"
            />
            {newsletters.map((newsletter, i) => (
              <div
                key={i}
                css={[newsletterCard, manualRow(2, newsletterSpanDef)]}
              >
                <h2>{newsletter.name}</h2>
                <p>{newsletter.description}</p>
                <CheckboxGroup
                  name={newsletter.id}
                  label={newsletter.name}
                  hideLabel={true}
                  cssOverrides={checkboxGroup}
                >
                  <Checkbox
                    value={newsletter.id}
                    label="Sign Up"
                    /* TODO: What is the status on this? defaultChecked={props.newsletter.subscribed} */
                  />
                </CheckboxGroup>
                <Button type="submit">Continue to The Guardian</Button>
              </div>
            ))}
          </Container>
        </div>
        <CsrfFormField />
      </form>
      <Footer />
    </>
  );
};
