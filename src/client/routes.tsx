import React from 'react';
import { Route, RouteProps, Routes as RouterRoutes } from 'react-router-dom';
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
  <RouterRoutes>
    <TypedRoute path={'/signin'} element={<SignInPage />}></TypedRoute>
    <TypedRoute path={'/register'} element={<RegistrationPage />}></TypedRoute>
    <TypedRoute
      path={'/register/email-sent'}
      element={<RegistrationEmailSentPage />}
    ></TypedRoute>
    <TypedRoute path={'/reset'} element={<ResetPasswordPage />}></TypedRoute>
    <TypedRoute
      path={'/reset/email-sent'}
      element={<EmailSentPage noAccountInfo />}
    ></TypedRoute>
    <TypedRoute
      path={'/reset-password/:token'}
      element={<ChangePasswordPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/password/reset-confirmation'}
      element={<ChangePasswordCompletePage />}
    ></TypedRoute>
    <TypedRoute
      path={'/reset/resend'}
      element={<ResendPasswordPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/reset/expired'}
      element={<ResetPasswordSessionExpiredPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/set-password/resend'}
      element={<SetPasswordResendPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/set-password/expired'}
      element={<SetPasswordSessionExpiredPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/set-password/complete'}
      element={<SetPasswordCompletePage />}
    ></TypedRoute>
    <TypedRoute
      path={'/set-password/email-sent'}
      element={<EmailSentPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/set-password/:token'}
      element={<SetPasswordPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/consents/data'}
      element={<ConsentsDataPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/consents/communication'}
      element={<ConsentsCommunicationPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/consents/newsletters'}
      element={<ConsentsNewslettersPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/consents/review'}
      element={<ConsentsConfirmationPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/welcome/resend'}
      element={<WelcomeResendPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/welcome/expired'}
      element={<WelcomeSessionExpiredPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/welcome/email-sent'}
      element={<EmailSentPage />}
    ></TypedRoute>
    <TypedRoute
      path={'/welcome/complete'}
      element={<WelcomePasswordAlreadySetPage />}
    ></TypedRoute>
    <TypedRoute path={'/welcome/:token'} element={<WelcomePage />}></TypedRoute>
    <TypedRoute
      path={'/verify-email'}
      element={<ResendEmailVerificationPage />}
    ></TypedRoute>
    <TypedRoute path={'/magic-link'} element={<MagicLinkPage />}></TypedRoute>
    <TypedRoute
      path={'/magic-link/email-sent'}
      element={<EmailSentPage noAccountInfo />}
    ></TypedRoute>
    <TypedRoute path={'/error'} element={<UnexpectedErrorPage />}></TypedRoute>
    <TypedRoute path={'/404'} element={<NotFoundPage />}></TypedRoute>
  </RouterRoutes>
);
