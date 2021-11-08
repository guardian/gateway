import React from 'react';
import { Route, Routes as RouterRoutes } from 'react-router-dom';
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
import { ConsentsFollowUpPage } from '@/client/pages/ConsentsFollowUpPage';
import { ClientState } from '@/shared/model/ClientState';
import { Routes } from '@/shared/model/Routes';
import { SignInPage } from '@/client/pages/SignInPage';
import { MagicLinkPage } from '@/client/pages/MagicLinkPage';
import { WelcomePage } from '@/client/pages/WelcomePage';
import { WelcomeResendPage } from '@/client/pages/WelcomeResend';
import { RegistrationEmailSentPage } from '@/client/pages/RegistrationEmailSentPage';
import { ResetPasswordSessionExpiredPage } from '@/client/pages/ResetPasswordSessionExpiredPage';
import { WelcomeSessionExpiredPage } from '@/client/pages/WelcomeSessionExpiredPage';
import { SetPasswordPage } from '@/client/pages/SetPasswordPage';
import { SetPasswordResendPage } from '@/client/pages/SetPasswordResendPage';
import { SetPasswordSessionExpiredPage } from '@/client/pages/SetPasswordSessionExpiredPage';
import { SetPasswordCompletePage } from '@/client/pages/SetPasswordCompletePage';

export type RoutingConfig = {
  clientState: ClientState;
  location: string;
};

export const GatewayRoutes = () => (
  <RouterRoutes>
    <Route path={Routes.SIGN_IN} element={<SignInPage />} />
    <Route path={Routes.REGISTRATION} element={<RegistrationPage />} />
    <Route
      path={`${Routes.REGISTRATION}${Routes.EMAIL_SENT}`}
      element={<RegistrationEmailSentPage />}
    />
    <Route path={Routes.RESET} element={<ResetPasswordPage />} />
    <Route
      path={`${Routes.RESET}${Routes.EMAIL_SENT}`}
      element={<EmailSentPage />}
    />
    <Route
      path={`${Routes.CHANGE_PASSWORD}${Routes.TOKEN_PARAM}`}
      element={<ChangePasswordPage />}
    />
    <Route
      path={`${Routes.PASSWORD}${Routes.RESET_CONFIRMATION}`}
      element={<ChangePasswordCompletePage />}
    />
    <Route
      path={`${Routes.RESET}${Routes.RESEND}`}
      element={<ResendPasswordPage />}
    />
    <Route
      path={`${Routes.RESET}${Routes.EXPIRED}`}
      element={<ResetPasswordSessionExpiredPage />}
    />
    <Route
      path={`${Routes.SET_PASSWORD}${Routes.RESEND}`}
      element={<SetPasswordResendPage />}
    />
    <Route
      path={`${Routes.SET_PASSWORD}${Routes.EXPIRED}`}
      element={<SetPasswordSessionExpiredPage />}
    />
    <Route
      path={`${Routes.SET_PASSWORD}${Routes.COMPLETE}`}
      element={<SetPasswordCompletePage />}
    />
    <Route
      path={`${Routes.SET_PASSWORD}${Routes.EMAIL_SENT}`}
      element={<EmailSentPage />}
    />
    <Route
      path={`${Routes.SET_PASSWORD}${Routes.TOKEN_PARAM}`}
      element={<SetPasswordPage />}
    />
    <Route
      path={`${Routes.CONSENTS}${Routes.CONSENTS_DATA}`}
      element={<ConsentsDataPage />}
    />
    <Route
      path={`${Routes.CONSENTS}${Routes.CONSENTS_COMMUNICATION}`}
      element={<ConsentsCommunicationPage />}
    />
    <Route
      path={`${Routes.CONSENTS}${Routes.CONSENTS_NEWSLETTERS}`}
      element={<ConsentsNewslettersPage />}
    />
    <Route
      path={`${Routes.CONSENTS}${Routes.CONSENTS_REVIEW}`}
      element={<ConsentsConfirmationPage />}
    />
    <Route
      path={`${Routes.WELCOME}${Routes.RESEND}`}
      element={<WelcomeResendPage />}
    />
    <Route
      path={`${Routes.WELCOME}${Routes.EXPIRED}`}
      element={<WelcomeSessionExpiredPage />}
    />
    <Route
      path={`${Routes.WELCOME}${Routes.EMAIL_SENT}`}
      element={<EmailSentPage />}
    />
    <Route
      path={`${Routes.WELCOME}${Routes.TOKEN_PARAM}`}
      element={<WelcomePage />}
    />
    {/*  ABTEST: followupConsent : START */}
    <Route
      path={`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_NEWSLETTERS}`}
      element={<ConsentsFollowUpPage />}
    />
    <Route
      path={`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_CONSENTS}`}
      element={<ConsentsFollowUpPage />}
    />
    {/*  ABTEST: followupConsent : END */}
    <Route
      path={Routes.VERIFY_EMAIL}
      element={<ResendEmailVerificationPage />}
    />
    <Route path={Routes.MAGIC_LINK} element={<MagicLinkPage />} />
    <Route
      path={`${Routes.MAGIC_LINK}${Routes.EMAIL_SENT}`}
      element={<EmailSentPage />}
    />
    <Route path={Routes.UNEXPECTED_ERROR} element={<UnexpectedErrorPage />} />
    <Route path={Routes.FOUR_ZERO_FOUR} element={<NotFoundPage />} />
  </RouterRoutes>
);
