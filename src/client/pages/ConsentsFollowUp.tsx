import { ClientState } from '@/shared/model/ClientState';
import { Routes } from '@/shared/model/Routes';
import { css } from '@emotion/react';
import { brand } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { titlepiece } from '@guardian/src-foundations/typography';
import { Column, Columns, Container } from '@guardian/src-layout';
import React, { useContext } from 'react';
import { ClientStateContext } from '../components/ClientState';
import { CsrfFormField } from '../components/CsrfFormField';
import { Footer } from '../components/Footer';
import { GlobalError } from '../components/GlobalError';
import { GlobalSuccess } from '../components/GlobalSuccess';
import { NavBar } from '../components/NavBar';
import { getErrorLink } from '../lib/ErrorLink';
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

export const ConsentsFollowUp = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {} } = clientState;
  const newsletters = clientState?.pageData?.newsletters ?? [];
  return (
    <>
      <div css={headerContainer}>
        <NavBar cssOverrides={header} />
        {error && <GlobalError error={error} link={getErrorLink(error)} left />}
        {success && <GlobalSuccess success={success} />}
      </div>
      <div css={titleContainer}>
        <Container>
          <Columns>
            <Column width={[1, 0.5]}>
              <h1 css={h1}>Get the headlines in your inbox</h1>
            </Column>
          </Columns>
        </Container>
      </div>
      <form
        action={`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP}`}
        method="post"
      >
        <CsrfFormField />
      </form>
      <Footer />
    </>
  );
};
