import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ResetPasswordPage } from '@/client/pages/ResetPassword';
import { ResetSentPage } from '@/client/pages/ResetSent';
import { Routes } from '@/shared/model/Routes';
import { NotFound } from '@/client/pages/NotFound';
import { ChangePasswordPage } from '@/client/pages/ChangePassword';
import { ChangePasswordCompletePage } from '@/client/pages/ChangePasswordComplete';
import { ResendPasswordPage } from '@/client/pages/ResendPassword';
import { ConsentsDataPage } from '@/client/pages/ConsentsData';
import { ConsentsCommunicationPage } from '@/client/pages/ConsentsCommunication';
import { ConsentsNewslettersPage } from '@/client/pages/ConsentsNewsletters';
import { ConsentsConfirmationPage } from '@/client/pages/ConsentsConfirmation';

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
    <Route>
      <NotFound />
    </Route>
  </Switch>
);
