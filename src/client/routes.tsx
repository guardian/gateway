import React from 'react';
import { Route, Switch } from 'react-router-dom';
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

export type RoutingConfig = {
  clientState: ClientState;
  location: string;
};

export const GatewayRoutes = () => (
  <Switch>
    <Route exact path={Routes.SIGN_IN_CURRENT}>
      <SignInPage />
    </Route>
    <Route exact path={Routes.SIGN_IN}>
      <SignInPage />
    </Route>
    <Route exact path={Routes.REGISTRATION}>
      <RegistrationPage />
    </Route>
    <Route exact path={Routes.REGISTRATION_EMAIL_SENT}>
      <RegistrationEmailSentPage />
    </Route>
    <Route exact path={Routes.RESET}>
      <ResetPasswordPage />
    </Route>
    <Route exact path={Routes.RESET_SENT}>
      <EmailSentPage />
    </Route>
    <Route exact path={`${Routes.CHANGE_PASSWORD}${Routes.TOKEN_PARAM}`}>
      <ChangePasswordPage />
    </Route>
    <Route path={Routes.CHANGE_PASSWORD_COMPLETE}>
      <ChangePasswordCompletePage />
    </Route>
    <Route exact path={`${Routes.RESET}${Routes.RESEND}`}>
      <ResendPasswordPage />
    </Route>
    <Route exact path={`${Routes.RESET}${Routes.EXPIRED}`}>
      <ResetPasswordSessionExpiredPage />
    </Route>
    <Route exact path={`${Routes.CONSENTS}${Routes.CONSENTS_DATA}`}>
      <ConsentsDataPage />
    </Route>
    <Route exact path={`${Routes.CONSENTS}${Routes.CONSENTS_COMMUNICATION}`}>
      <ConsentsCommunicationPage />
    </Route>
    <Route exact path={`${Routes.CONSENTS}${Routes.CONSENTS_NEWSLETTERS}`}>
      <ConsentsNewslettersPage />
    </Route>
    <Route exact path={`${Routes.CONSENTS}${Routes.CONSENTS_REVIEW}`}>
      <ConsentsConfirmationPage />
    </Route>
    <Route exact path={`${Routes.WELCOME}${Routes.RESEND}`}>
      <WelcomeResendPage />
    </Route>
    <Route exact path={`${Routes.WELCOME}${Routes.EXPIRED}`}>
      <WelcomeSessionExpiredPage />
    </Route>
    <Route exact path={`${Routes.WELCOME_SENT}`}>
      <EmailSentPage />
    </Route>
    <Route exact path={`${Routes.WELCOME}${Routes.TOKEN_PARAM}`}>
      <WelcomePage />
    </Route>
    {/*  ABTEST: followupConsent : START */}
    <Route
      exact
      path={`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_NEWSLETTERS}`}
    >
      <ConsentsFollowUpPage />
    </Route>
    <Route
      exact
      path={`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_CONSENTS}`}
    >
      <ConsentsFollowUpPage />
    </Route>
    {/*  ABTEST: followupConsent : END */}
    <Route exact path={Routes.VERIFY_EMAIL}>
      <ResendEmailVerificationPage />
    </Route>
    <Route exact path={Routes.MAGIC_LINK}>
      <MagicLinkPage />
    </Route>
    <Route exact path={Routes.MAGIC_LINK_SENT}>
      <EmailSentPage />
    </Route>
    <Route exact path={Routes.UNEXPECTED_ERROR}>
      <UnexpectedErrorPage />
    </Route>
    <Route>
      <NotFoundPage />
    </Route>
  </Switch>
);
