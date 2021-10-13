import React from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { Header } from '@/client/components/Header';
import { Nav } from '@/client/components/Nav';
import { Footer } from '@/client/components/Footer';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { topMargin } from '@/client/styles/Shared';
import { border, space } from '@guardian/src-foundations';
import { css } from '@emotion/react';
import { from } from '@guardian/src-foundations/mq';
import { MainGrid } from '../layouts/MainGrid';
import { gridItemSignInAndRegistration } from '../styles/Grid';
import { Divider } from '@guardian/source-react-components-development-kitchen';

type Props = {
  returnUrl?: string;
  email?: string;
  refValue?: string;
  refViewId?: string;
};

const registerButton = css`
  width: 100%;
  justify-content: center;
  margin-top: ${space[5]}px;
  ${from.mobileMedium} {
    margin-top: 16px;
  }
`;

const divider = css`
  /* Undoes the negative margin */
  margin-bottom: 0;
  margin-top: ${space[4]}px;
  ${from.mobileMedium} {
    margin-top: ${space[6]}px;
  }
  :before,
  :after {
    content: '';
    flex: 1 1;
    border-bottom: 1px solid ${border.secondary};
    margin: 8px;
  }
`;

export const Registration = ({
  returnUrl = '',
  refValue = '',
  refViewId = '',
  email = '',
}: Props) => {
  const returnUrlQuery = `returnUrl=${encodeURIComponent(returnUrl)}`;
  const refUrlQuery = `ref=${encodeURIComponent(refValue)}`;
  const refViewIdUrlQuery = `refViewId=${encodeURIComponent(refViewId)}`;
  const registrationUrlQueryParams = [
    returnUrl ? returnUrlQuery : '',
    refValue ? refUrlQuery : '',
    refViewId ? refViewIdUrlQuery : '',
  ];
  const registrationUrlQueryParamString = registrationUrlQueryParams
    .filter((param) => param !== '')
    .join('&');

  return (
    <>
      <Header />
      <Nav
        tabs={[
          {
            displayText: PageTitle.SIGN_IN,
            linkTo: Routes.SIGN_IN,
            isActive: false,
          },
          {
            displayText: PageTitle.REGISTRATION,
            linkTo: Routes.REGISTRATION,
            isActive: true,
          },
        ]}
      />
      <MainGrid gridSpanDefinition={gridItemSignInAndRegistration}>
        <form
          method="post"
          action={`${Routes.REGISTRATION}?${registrationUrlQueryParamString}`}
        >
          <CsrfFormField />
          <div css={topMargin}>
            <TextInput
              label="Email"
              name="email"
              type="email"
              defaultValue={email}
            />
          </div>
          <Terms />
          <Button css={registerButton} type="submit" data-cy="register-button">
            Register
          </Button>
        </form>
        <Divider
          spaceAbove="loose"
          displayText="or continue with"
          cssOverrides={divider}
        />
        <SocialButtons returnUrl={returnUrl} />
      </MainGrid>
      <Footer />
    </>
  );
};
