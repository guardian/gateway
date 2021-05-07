import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ResetPasswordPage } from '@/client/pages/ResetPasswordPage';
import { ResetSentPage } from '@/client/pages/ResetSentPage';
import { Routes } from '@/shared/model/Routes';
import { NotFound } from '@/client/pages/NotFound';
import { ChangePasswordPage } from '@/client/pages/ChangePassword';
import { ChangePasswordCompletePage } from '@/client/pages/ChangePasswordCompletePage';
import { ResendPasswordPage } from '@/client/pages/ResendPasswordPage';
import { ConsentsDataPage } from '@/client/pages/ConsentsDataPage';
import { ConsentsCommunicationPage } from '@/client/pages/ConsentsCommunication';
import { ConsentsNewslettersPage } from '@/client/pages/ConsentsNewsletters';
import { ConsentsConfirmationPage } from '@/client/pages/ConsentsConfirmationPage';
import { ResendEmailVerificationPage } from '@/client/pages/ResendEmailVerificationPage';
import { ClientState } from '@/shared/model/ClientState';
import { UnexpectedError } from '@/client/pages/UnexpectedError';
import { ConsentsFollowUp } from './pages/ConsentsFollowUp';

export type RoutingConfig = {
  clientState: ClientState;
  location: string;
};

export const GatewayRoutes = () => (
  <Switch>
    <Route exact path={Routes.RESET}>
      <ResetPasswordPage />
    </Route>
    <Route exact path={Routes.RESET_SENT}>
      <ResetSentPage />
    </Route>
    <Route
      exact
      path={`${Routes.CHANGE_PASSWORD}${Routes.CHANGE_PASSWORD_TOKEN}`}
    >
      <ChangePasswordPage />
    </Route>
    <Route path={Routes.CHANGE_PASSWORD_COMPLETE}>
      <ChangePasswordCompletePage />
    </Route>
    <Route exact path={Routes.RESET_RESEND}>
      <ResendPasswordPage />
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
    {/*  ABTEST: followupConsent : START */}
    <Route
      exact
      path={`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_NEWSLETTERS}`}
    >
      <ConsentsFollowUp />
    </Route>
    <Route
      exact
      path={`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP_CONSENTS}`}
    >
      <ConsentsFollowUp />
    </Route>
    {/*  ABTEST: followupConsent : END */}
    <Route exact path={Routes.VERIFY_EMAIL}>
      <ResendEmailVerificationPage />
    </Route>
    <Route exact path={Routes.UNEXPECTED_ERROR}>
      <UnexpectedError />
    </Route>
    <Route>
      <NotFound />
    </Route>
  </Switch>
);
