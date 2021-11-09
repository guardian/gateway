import React, { PropsWithChildren } from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { Routes } from '@/shared/model/Routes';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { form, textInput, button } from '@/client/styles/Shared';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';

interface ResetPasswordProps {
  email?: string;
  headerText: string;
  buttonText: string;
  queryString?: string;
  formActionOverride?: string;
}

export const ResetPassword = ({
  email = '',
  headerText,
  buttonText,
  queryString = '',
  formActionOverride,
  children,
}: PropsWithChildren<ResetPasswordProps>) => (
  <>
    <Header />
    <Main subTitle="Sign in">
      <PageBox>
        <PageHeader>{headerText}</PageHeader>
        <PageBody>
          {children}
          <form
            css={form}
            method="post"
            action={
              formActionOverride
                ? `${formActionOverride}${queryString}`
                : `${Routes.RESET}${queryString}`
            }
          >
            <CsrfFormField />
            <TextInput
              css={textInput}
              label="Email address"
              name="email"
              type="email"
              defaultValue={email}
            />
            <Button
              css={button}
              type="submit"
              icon={<SvgArrowRightStraight />}
              iconSide="right"
              data-cy="reset-password-button"
            >
              {buttonText}
            </Button>
          </form>
        </PageBody>
      </PageBox>
    </Main>
    <Footer />
  </>
);
