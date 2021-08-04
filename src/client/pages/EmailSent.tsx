import React, { useState, useEffect } from 'react';
import { Link } from '@guardian/src-link';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { button } from '@/client/styles/Shared';
import { CsrfFormField } from '@/client/components/CsrfFormField';

type Props = {
  email?: string;
  previousPage?: string;
};

export const EmailSent = ({ email, previousPage }: Props) => {
  const [hasJS, setHasJS] = useState<boolean>(false);

  useEffect(() => {
    setHasJS(true);
  }, []);

  return (
    <>
      <Header />
      <Main subTitle="Sign in" successOverride="Email sent">
        <PageBox>
          <PageHeader>Check your email inbox</PageHeader>
          <PageBody>
            {email ? (
              <PageBodyText>We’ve sent an email to {email}.</PageBodyText>
            ) : (
              <PageBodyText>We’ve sent you an email.</PageBodyText>
            )}
            <PageBodyText>
              Please follow the instructions in this email. If you can&apos;t
              find it, it may be in your spam folder.
            </PageBodyText>
            <PageBodyText>The link is only valid for 30 minutes.</PageBodyText>
            {email && previousPage && hasJS && (
              <form method="post" action={previousPage}>
                <CsrfFormField />
                <TextInput
                  label=""
                  name="email"
                  type="email"
                  value={email}
                  hidden={true}
                />
                <br />
                <br />
                <Button
                  css={button}
                  type="submit"
                  data-cy="resend-email-button"
                >
                  Resend email
                </Button>
                <br />
                <br />
              </form>
            )}
            {previousPage && (
              <PageBodyText>
                Wrong email address?{' '}
                <Link subdued={true} href={previousPage}>
                  Change email address
                </Link>
              </PageBodyText>
            )}
          </PageBody>
        </PageBox>
      </Main>
      <Footer />
    </>
  );
};
