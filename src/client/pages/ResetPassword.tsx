import React, { PropsWithChildren } from 'react';
import { Routes } from '@/shared/model/Routes';
import { MainLayout } from '@/client/layouts/Main';
import {
  belowFormMarginTopSpacingStyle,
  MainForm,
} from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { MainBodyText } from '@/client/components/MainBodyText';
import { Link } from '@guardian/src-link';
import { InfoSummary } from '@guardian/source-react-components-development-kitchen';

interface ResetPasswordProps {
  email?: string;
  headerText: string;
  buttonText: string;
  queryString?: string;
  formActionOverride?: string;
  inputLabel?: string;
  showNoAccessEmail?: boolean;
  showRecentEmailSummary?: boolean;
}

export const ResetPassword = ({
  email = '',
  headerText,
  buttonText,
  queryString = '',
  formActionOverride,
  inputLabel,
  showNoAccessEmail,
  showRecentEmailSummary,
  children,
}: PropsWithChildren<ResetPasswordProps>) => (
  <MainLayout pageTitle={headerText}>
    {children}
    <MainForm
      formAction={
        formActionOverride
          ? `${formActionOverride}${queryString}`
          : `${Routes.RESET}${queryString}`
      }
      submitButtonText={buttonText}
    >
      <EmailInput label={inputLabel} defaultValue={email} />
    </MainForm>
    {showNoAccessEmail && (
      <MainBodyText cssOverrides={belowFormMarginTopSpacingStyle}>
        If you no longer have access to this email account please{' '}
        <Link subdued href="mailto:userhelp@theguardian.com">
          contact our help department
        </Link>
      </MainBodyText>
    )}
    {showRecentEmailSummary && (
      <InfoSummary
        cssOverrides={belowFormMarginTopSpacingStyle}
        message="Please make sure that you are opening the most recent email we sent."
        context={
          <>
            If you are having trouble, please contact our customer service team
            at{' '}
            <Link subdued href="mailto:userhelp@theguardian.com">
              userhelp@guardian.com
            </Link>
          </>
        }
      />
    )}
  </MainLayout>
);
