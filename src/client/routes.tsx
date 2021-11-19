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
import { Routes } from '@/shared/model/Routes';
import { RoutePathsAll } from '@/shared/lib/routeUtils';
import { SignInPage } from '@/client/pages/SignInPage';
import { MagicLinkPage } from '@/client/pages/MagicLinkPage';
import { WelcomePage } from '@/client/pages/WelcomePage';
import { WelcomeResendPage } from '@/client/pages/WelcomeResend';
import { WelcomePasswordAlreadySetPage } from '@/client/pages/WelcomePasswordAlreadySetPage';
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

interface GatewayRouteProps extends RouteProps {
  path?: RoutePathsAll;
}

const TypedRoute = (props: GatewayRouteProps) => {
  return <Route {...props} path={props.path as string}></Route>;
};

export const GatewayRoutes = () => (
  <Switch>
    <TypedRoute exact path={Routes.SIGN_IN}>
      <SignInPage />
    </TypedRoute>
    <TypedRoute exact path={Routes.REGISTRATION}>
      <RegistrationPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.REGISTRATION}${Routes.EMAIL_SENT}`}>
      <RegistrationEmailSentPage />
    </TypedRoute>
    <TypedRoute exact path={Routes.RESET}>
      <ResetPasswordPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.RESET}${Routes.EMAIL_SENT}`}>
      <EmailSentPage noAccountInfoBox />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.CHANGE_PASSWORD}${Routes.TOKEN_PARAM}`}>
      <ChangePasswordPage />
    </TypedRoute>
    <TypedRoute path={`${Routes.PASSWORD}${Routes.RESET_CONFIRMATION}`}>
      <ChangePasswordCompletePage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.RESET}${Routes.RESEND}`}>
      <ResendPasswordPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.RESET}${Routes.EXPIRED}`}>
      <ResetPasswordSessionExpiredPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.SET_PASSWORD}${Routes.RESEND}`}>
      <SetPasswordResendPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.SET_PASSWORD}${Routes.EXPIRED}`}>
      <SetPasswordSessionExpiredPage />
    </TypedRoute>
    <TypedRoute path={`${Routes.SET_PASSWORD}${Routes.COMPLETE}`}>
      <SetPasswordCompletePage />
    </TypedRoute>
    <TypedRoute path={`${Routes.SET_PASSWORD}${Routes.EMAIL_SENT}`}>
      <EmailSentPage helpInfoBox />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.SET_PASSWORD}${Routes.TOKEN_PARAM}`}>
      <SetPasswordPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.CONSENTS}${Routes.CONSENTS_DATA}`}>
      <ConsentsDataPage />
    </TypedRoute>
    <TypedRoute
      exact
      path={`${Routes.CONSENTS}${Routes.CONSENTS_COMMUNICATION}`}
    >
      <ConsentsCommunicationPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.CONSENTS}${Routes.CONSENTS_NEWSLETTERS}`}>
      <ConsentsNewslettersPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.CONSENTS}${Routes.CONSENTS_REVIEW}`}>
      <ConsentsConfirmationPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.WELCOME}${Routes.RESEND}`}>
      <WelcomeResendPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.WELCOME}${Routes.EXPIRED}`}>
      <WelcomeSessionExpiredPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.WELCOME}${Routes.EMAIL_SENT}`}>
      <EmailSentPage helpInfoBox />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.WELCOME}${Routes.COMPLETE}`}>
      <WelcomePasswordAlreadySetPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.WELCOME}${Routes.TOKEN_PARAM}`}>
      <WelcomePage />
    </TypedRoute>
    <TypedRoute exact path={Routes.VERIFY_EMAIL}>
      <ResendEmailVerificationPage />
    </TypedRoute>
    <TypedRoute exact path={Routes.MAGIC_LINK}>
      <MagicLinkPage />
    </TypedRoute>
    <TypedRoute exact path={`${Routes.MAGIC_LINK}${Routes.EMAIL_SENT}`}>
      <EmailSentPage noAccountInfoBox />
    </TypedRoute>
    <TypedRoute exact path={Routes.UNEXPECTED_ERROR}>
      <UnexpectedErrorPage />
    </TypedRoute>
    <TypedRoute>
      <NotFoundPage />
    </TypedRoute>
  </Switch>
);
