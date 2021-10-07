import React from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Nav } from '@/client/components/Nav';
import { Footer } from '@/client/components/Footer';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { button, form, textInput } from '@/client/styles/Shared';
import { Divider } from '@guardian/source-react-components-development-kitchen/';
import { css } from '@emotion/react';

type Props = {
  returnUrl?: string;
  email?: string;
  refValue?: string;
  refViewId?: string;
};

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
      <Main>
        <PageBox>
          <PageBody>
            <form
              css={form}
              method="post"
              action={`${Routes.REGISTRATION}?${registrationUrlQueryParamString}`}
            >
              <CsrfFormField />
              <TextInput
                css={textInput}
                label="Email"
                name="email"
                type="email"
                defaultValue={email}
              />
              <Button css={button} type="submit" data-cy="register-button">
                Register
              </Button>
            </form>
            <Divider
              size="full"
              spaceAbove="loose"
              displayText="or continue with"
              cssOverrides={css`
                :before {
                  margin-left: 0;
                }
                :after {
                  margin-right: 0;
                }
              `}
            />
            <SocialButtons returnUrl={returnUrl} />
            <Divider
              size="full"
              spaceAbove="tight"
              cssOverrides={css`
                :before {
                  margin-left: 0;
                }
                :after {
                  margin-right: 0;
                }
              `}
            />
            <Terms />
          </PageBody>
        </PageBox>
      </Main>
      <Footer />
    </>
  );
};
