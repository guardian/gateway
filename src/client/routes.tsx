import React from 'react';
import { Route, RouteProps, Switch } from 'react-router-dom';
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
import { RoutePaths } from '@/shared/model/Routes';

export type RoutingConfig = {
  clientState: ClientState;
  location: string;
};

interface GatewayRouteProps extends RouteProps {
  path?: RoutePaths;
}

const TypedRoute = (props: GatewayRouteProps) => {
  return <Route {...props} path={props.path as string}></Route>;
};

export const GatewayRoutes = () => (
  <Switch>
    <TypedRoute exact path={'/signin'}>
      <SignInPage />
    </TypedRoute>
    <TypedRoute exact path={'/register'}>
      <RegistrationPage />
    </TypedRoute>
    <TypedRoute exact path={'/register/email-sent'}>
      <RegistrationEmailSentPage />
    </TypedRoute>
    <TypedRoute exact path={'/reset'}>
      <ResetPasswordPage />
    </TypedRoute>
    <TypedRoute exact path={'/reset/email-sent'}>
      <EmailSentPage noAccountInfo />
    </TypedRoute>
    <TypedRoute exact path={'/reset-password/:token'}>
      <ChangePasswordPage />
    </TypedRoute>
    <TypedRoute path={'/password/reset-confirmation'}>
      <ChangePasswordCompletePage />
    </TypedRoute>
    <TypedRoute exact path={'/reset/resend'}>
      <ResendPasswordPage />
    </TypedRoute>
    <TypedRoute exact path={'/reset/expired'}>
      <ResetPasswordSessionExpiredPage />
    </TypedRoute>
    <TypedRoute exact path={'/set-password/resend'}>
      <SetPasswordResendPage />
    </TypedRoute>
    <TypedRoute exact path={'/set-password/expired'}>
      <SetPasswordSessionExpiredPage />
    </TypedRoute>
    <TypedRoute path={'/set-password/complete'}>
      <SetPasswordCompletePage />
    </TypedRoute>
    <TypedRoute path={'/set-password/email-sent'}>
      <EmailSentPage />
    </TypedRoute>
    <TypedRoute exact path={'/set-password/:token'}>
      <SetPasswordPage />
    </TypedRoute>
    <TypedRoute exact path={'/consents/data'}>
      <ConsentsDataPage />
    </TypedRoute>
    <TypedRoute exact path={'/consents/communication'}>
      <ConsentsCommunicationPage />
    </TypedRoute>
    <TypedRoute exact path={'/consents/newsletters'}>
      <ConsentsNewslettersPage />
    </TypedRoute>
    <TypedRoute exact path={'/consents/review'}>
      <ConsentsConfirmationPage />
    </TypedRoute>
    <TypedRoute exact path={'/welcome/resend'}>
      <WelcomeResendPage />
    </TypedRoute>
    <TypedRoute exact path={'/welcome/expired'}>
      <WelcomeSessionExpiredPage />
    </TypedRoute>
    <TypedRoute exact path={'/welcome/email-sent'}>
      <EmailSentPage />
    </TypedRoute>
    <TypedRoute exact path={'/welcome/complete'}>
      <WelcomePasswordAlreadySetPage />
    </TypedRoute>
    <TypedRoute exact path={'/welcome/:token'}>
      <WelcomePage />
    </TypedRoute>
    <TypedRoute exact path={'/verify-email'}>
      <ResendEmailVerificationPage />
    </TypedRoute>
    <TypedRoute exact path={'/magic-link'}>
      <MagicLinkPage />
    </TypedRoute>
    <TypedRoute exact path={'/magic-link/email-sent'}>
      <EmailSentPage noAccountInfo />
    </TypedRoute>
    <TypedRoute exact path={'/error'}>
      <UnexpectedErrorPage />
    </TypedRoute>
    <TypedRoute>
      <NotFoundPage />
    </TypedRoute>
  </Switch>
);
