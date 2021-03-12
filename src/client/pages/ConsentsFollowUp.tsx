import { ClientState } from '@/shared/model/ClientState';
import { Routes } from '@/shared/model/Routes';
import { css } from '@emotion/react';
import { Button } from '@guardian/src-button';
import { Checkbox, CheckboxGroup } from '@guardian/src-checkbox';
import { brand } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { titlepiece } from '@guardian/src-foundations/typography';
import { Container } from '@guardian/src-layout';
import React, { useContext } from 'react';
import { ClientStateContext } from '../components/ClientState';
import { CsrfFormField } from '../components/CsrfFormField';
import { Footer } from '../components/Footer';
import { GlobalError } from '../components/GlobalError';
import { GlobalSuccess } from '../components/GlobalSuccess';
import { NavBar } from '../components/NavBar';
import { getErrorLink } from '../lib/ErrorLink';
import { getAutoRow, gridItemColumnConsents, gridRow } from '../styles/Grid';
import { maxWidth } from '../styles/Shared';

const GUARDIAN_BRAND = brand[400];
const ELECTION_BEIGE = '#DDDBD1';

const header = css`
  ${maxWidth}
  margin: 0 auto;
  padding-right: 0;
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
  ${from.tablet} {
    ${titlepiece.large()};
  }
`;

const titleContainer = css`
  background-color: ${GUARDIAN_BRAND};
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
        <div>
          <Container cssOverrides={gridRow}>
            {newsletters.map((newsletter, i) => (
              <div key={i} css={autoRow()}>
                <h2>{newsletter.name}</h2>
                <p>{newsletter.description}</p>
                <CheckboxGroup
                  name={newsletter.id}
                  label={newsletter.name}
                  hideLabel={true}
                >
                  <Checkbox
                    value={newsletter.id}
                    label="Sign Up"
                    /* defaultChecked={props.newsletter.subscribed} */
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
