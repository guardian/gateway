import React, { useState, useEffect } from 'react';
import { Link } from '@guardian/src-link';
import { InfoSummary } from '@guardian/source-react-components-development-kitchen';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
  belowFormMarginTopSpacingStyle,
  MainForm,
} from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { Routes } from '@/shared/model/Routes';

type Props = {
  email?: string;
  previousPage?: string;
  resendEmailAction?: string;
  refViewId?: string;
  refValue?: string;
  returnUrl?: string;
  showSuccess?: boolean;
};

export const EmailSent = ({
  email,
  previousPage = '/',
  resendEmailAction,
  refViewId = '',
  refValue = '',
  returnUrl = '',
  showSuccess,
}: Props) => {
  const [hasJS, setHasJS] = useState<boolean>(false);

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

  useEffect(() => {
    setHasJS(true);
  }, []);

  return (
    <MainLayout
      pageTitle="Check your email inbox"
      successOverride={showSuccess ? 'Email sent' : undefined}
    >
      {email ? (
        <MainBodyText>
          We’ve sent an email to <b>{email}</b>.
        </MainBodyText>
      ) : (
        <MainBodyText>We’ve sent you an email.</MainBodyText>
      )}
      <MainBodyText>
        Please follow the instructions in this email. If you can’t find it, it
        may be in your spam folder.
      </MainBodyText>
      <MainBodyText>
        <b>This link is only valid for 30 minutes.</b>
      </MainBodyText>
      {previousPage && (
        <MainBodyText>
          Wrong email address?{' '}
          <Link subdued href={previousPage}>
            Change email address
          </Link>
        </MainBodyText>
      )}
      {email && resendEmailAction && hasJS && (
        <>
          <InfoSummary
            message="Didn’t receive an email?"
            context="If you can’t find the email in your inbox or spam folder, please click below and we will send you a new one."
          />
          <MainForm
            formAction={
              resendEmailAction + '?' + registrationUrlQueryParamString
            }
            submitButtonText={'Resend email'}
            submitButtonPriority="tertiary"
            submitButtonHalfWidth
          >
            <EmailInput value={email} hidden hideLabel />
          </MainForm>
          <InfoSummary
            cssOverrides={belowFormMarginTopSpacingStyle}
            message="If you don’t receive an email within 2 minutes you may not have an account."
            context={
              <>
                Don’t have an account?{' '}
                <Link subdued href={Routes.REGISTRATION}>
                  Register for free
                </Link>
                <br />
                If you are having trouble, please contact our customer service
                team at{' '}
                <Link subdued href="mailto:userhelp@theguardian.com">
                  userhelp@guardian.com
                </Link>
              </>
            }
          />
        </>
      )}
    </MainLayout>
  );
};
