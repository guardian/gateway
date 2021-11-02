import React from 'react';
import { css } from '@emotion/react';
import { textSans } from '@guardian/src-foundations/typography';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { MainOld } from '@/client/layouts/MainOld';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { Routes } from '@/shared/model/Routes';
import { button, form, textInput } from '@/client/styles/Shared';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { ExternalLink } from '@/client/components/ExternalLink';

type Props = {
  email?: string;
};

export const MagicLink = ({ email }: Props) => {
  return (
    <>
      <Header />
      <MainOld subTitle="Sign in">
        <PageBox>
          <PageHeader>Link to sign in</PageHeader>
          <PageBody>
            <form css={form} method="post" action={`${Routes.MAGIC_LINK}`}>
              <CsrfFormField />
              <p
                css={css`
                  ${textSans.medium()}
                  margin-top: 0;
                `}
              >
                We can email you a one time link to sign into your account
              </p>
              <TextInput
                css={textInput}
                label="Email"
                name="email"
                type="email"
                value={email}
              />
              <Button css={button} type="submit" data-cy="magic-link-button">
                Email me a link
              </Button>
              <p
                css={css`
                  ${textSans.medium()}
                `}
              >
                If you no longer have access to this email account please{' '}
                <ExternalLink subdued={true} href="/help/contact-us">
                  contact our help department
                </ExternalLink>
              </p>
            </form>
          </PageBody>
        </PageBox>
      </MainOld>
      <Footer />
    </>
  );
};
