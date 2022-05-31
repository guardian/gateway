import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { RoutePaths } from '@/shared/model/Routes';
import { RegistrationPage } from '@/client/pages/RegistrationPage';
import { ResetPasswordPage } from '@/client/pages/ResetPasswordPage';
import { EmailSentPage } from '@/client/pages/EmailSentPage';
import { NotFoundPage } from '@/client/pages/NotFoundPage';
import { ChangePasswordPage } from '@/client/pages/ChangePasswordPage';
import { ChangePasswordCompletePage } from '@/client/pages/ChangePasswordCompletePage';
import { ResendPasswordPage } from '@/client/pages/ResendPasswordPage';
import { ConsentsDataPage } from '@/client/pages/ConsentsDataPage';
import { ConsentsCommunicationPage } from '@/client/pages/ConsentsCommunicationPage';
import { ConsentsNewslettersPage } from '@/client/pages/ConsentsNewslettersPage';
import { ConsentsConfirmationPage } from '@/client/pages/ConsentsConfirmationPage';
import { ResendEmailVerificationPage } from '@/client/pages/ResendEmailVerificationPage';
import { UnexpectedErrorPage } from '@/client/pages/UnexpectedErrorPage';
import { ClientState } from '@/shared/model/ClientState';
import { SignInPage } from '@/client/pages/SignInPage';
import { SignInSuccessPage } from '@/client/pages/SignInSuccessPage';
import { MagicLinkPage } from '@/client/pages/MagicLinkPage';
import { WelcomePage } from '@/client/pages/WelcomePage';
import { WelcomeResendPage } from '@/client/pages/WelcomeResendPage';
import { WelcomePasswordAlreadySetPage } from '@/client/pages/WelcomePasswordAlreadySetPage';
import { RegistrationEmailSentPage } from '@/client/pages/RegistrationEmailSentPage';
import { ResetPasswordSessionExpiredPage } from '@/client/pages/ResetPasswordSessionExpiredPage';
import { WelcomeSessionExpiredPage } from '@/client/pages/WelcomeSessionExpiredPage';
import { SetPasswordPage } from '@/client/pages/SetPasswordPage';
import { SetPasswordResendPage } from '@/client/pages/SetPasswordResendPage';
import { SetPasswordSessionExpiredPage } from '@/client/pages/SetPasswordSessionExpiredPage';
import { SetPasswordCompletePage } from '@/client/pages/SetPasswordCompletePage';
import { MaintenancePage } from '@/client/pages/MaintenancePage';
import { JobsTermsPage } from './pages/JobsTermsAcceptPage';

export type RoutingConfig = {
  clientState: ClientState;
  location: string;
};

const routes: Array<{
  path: RoutePaths;
  element: React.ReactElement;
}> = [
  {
    path: '/signin',
    element: <SignInPage />,
  },
  {
    path: '/signin/success',
    element: <SignInSuccessPage />,
  },
  {
    path: '/reauthenticate',
    element: <SignInPage />,
  },
  {
    path: '/register',
    element: <RegistrationPage />,
  },
  {
    path: '/register/email-sent',
    element: <RegistrationEmailSentPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/reset-password/email-sent',
    element: (
      <EmailSentPage formTrackingName="forgot-password-resend" noAccountInfo />
    ),
  },
  {
    path: '/reset-password/complete',
    element: <ChangePasswordCompletePage />,
  },
  {
    path: '/reset-password/resend',
    element: <ResendPasswordPage />,
  },
  {
    path: '/reset-password/expired',
    element: <ResetPasswordSessionExpiredPage />,
  },
  {
    path: '/reset-password/:token',
    element: <ChangePasswordPage />,
  },
  {
    path: '/set-password/resend',
    element: <SetPasswordResendPage />,
  },
  {
    path: '/set-password/expired',
    element: <SetPasswordSessionExpiredPage />,
  },
  {
    path: '/set-password/complete',
    element: <SetPasswordCompletePage />,
  },
  {
    path: '/set-password/email-sent',
    element: <EmailSentPage formTrackingName="set-password-resend" />,
  },
  {
    path: '/set-password/:token',
    element: <SetPasswordPage />,
  },
  {
    path: '/consents/data',
    element: <ConsentsDataPage />,
  },
  {
    path: '/consents/communication',
    element: <ConsentsCommunicationPage />,
  },
  {
    path: '/consents/newsletters',
    element: <ConsentsNewslettersPage />,
  },
  {
    path: '/consents/review',
    element: <ConsentsConfirmationPage />,
  },
  {
    path: '/welcome/resend',
    element: <WelcomeResendPage />,
  },
  {
    path: '/welcome/expired',
    element: <WelcomeSessionExpiredPage />,
  },
  {
    path: '/welcome/email-sent',
    element: <EmailSentPage formTrackingName="welcome-resend" />,
  },
  {
    path: '/welcome/complete',
    element: <WelcomePasswordAlreadySetPage />,
  },
  {
    path: '/agree/GRS',
    element: <JobsTermsPage />,
  },
  {
    path: '/welcome/:token',
    element: <WelcomePage />,
  },
  {
    path: '/verify-email',
    element: <ResendEmailVerificationPage />,
  },
  {
    path: '/magic-link',
    element: <MagicLinkPage />,
  },
  {
    path: '/magic-link/email-sent',
    element: <EmailSentPage noAccountInfo />,
  },
  {
    path: '/error',
    element: <UnexpectedErrorPage />,
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '/maintenance',
    element: <MaintenancePage />,
  },
];

export const GatewayRoutes = () => (
  <Routes>
    {routes.map(({ path, element }) => (
      <Route key={path} path={path} element={element}></Route>
    ))}
  </Routes>
);
