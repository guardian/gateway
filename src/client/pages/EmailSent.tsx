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
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { space } from '@guardian/src-foundations';
import { css } from '@emotion/react';

type Props = {
  email?: string;
  previousPage?: string;
  subTitle?: string;
  resendEmailAction?: string;
  refViewId?: string;
  refValue?: string;
  returnUrl?: string;
};

const button = css`
  margin-top: ${space[3]}px;
  margin-bottom: ${space[4]}px;
`;

export const EmailSent = ({
  email,
  previousPage = '/',
  resendEmailAction,
  refViewId = '',
  refValue = '',
  returnUrl = '',
}: Props) => {
  const [hasJS, setHasJS] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const returnUrlQuery = returnUrl
    ? `returnUrl=${encodeURIComponent(returnUrl)}`
    : '';

  const refUrlQuery = refValue ? `ref=${encodeURIComponent(refValue)}` : '';

  const refViewIdUrlQuery = refViewId
    ? `refViewId=${encodeURIComponent(refViewId)}`
    : '';

  const registrationUrlQueryParams = [
    returnUrlQuery,
    refUrlQuery,
    refViewIdUrlQuery,
  ]
    .filter((param) => param !== '')
    .join('&');

  useEffect(() => {
    setHasJS(true);
  }, []);

  const onResendClick = () => {
    setLoading(true);
  };

  return (
    <>
      <Header />
      <Main successOverride={loading ? undefined : 'Email sent'}>
        <PageBox>
          <PageHeader>Check your email inbox</PageHeader>
          <PageBody>
            {email ? (
              <PageBodyText>
                We’ve sent an email to <b>{email}</b>.
              </PageBodyText>
            ) : (
              <PageBodyText>We’ve sent you an email.</PageBodyText>
            )}
            <PageBodyText>
              Please follow the instructions in this email. If you can&apos;t
              find it, it may be in your spam folder.
            </PageBodyText>
            <PageBodyText>
              <b>The link is only valid for 30 minutes.</b>
            </PageBodyText>
            {email && resendEmailAction && hasJS && (
              <form
                method="post"
                action={resendEmailAction + '?' + registrationUrlQueryParams}
              >
                <CsrfFormField />
                <TextInput
                  label=""
                  name="email"
                  type="email"
                  value={email}
                  hidden={true}
                />
                <Button
                  css={button}
                  type="submit"
                  onClick={onResendClick}
                  data-cy="resend-email-button"
                >
                  {loading ? 'Resending...' : 'Resend email'}
                </Button>
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
