import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ResetPasswordPage } from '@/client/pages/ResetPassword';
import { ResetSentPage } from '@/client/pages/ResetSent';
import { Routes } from '@/shared/model/Routes';
import { NotFound } from '@/client/pages/NotFound';
import { ChangePasswordPage } from '@/client/pages/ChangePassword';
import { ChangePasswordCompletePage } from '@/client/pages/ChangePasswordComplete';
import { ResendPasswordPage } from '@/client/pages/ResendPassword';
import { ConsentsPage } from '@/client/pages/Consents';

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
    <Route exact path={Routes.CONSENTS}>
      <ConsentsPage />
    </Route>
    <Route>
      <NotFound />
    </Route>
  </Switch>
);
