import React, { useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Routes } from '@/shared/model/Routes';
import { Welcome } from '@/client/pages/Welcome';

export const WelcomePage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { fieldErrors = [] } = {} } = clientState;
  const { token } = useParams<{ token: string }>();

  const params = new URLSearchParams(search);
  const refViewId = params.get('refViewId') || undefined;
  const ref = params.get('ref') || undefined;

  return (
    <Welcome
      submitUrl={`${Routes.WELCOME}/${token}${search}`}
      fieldErrors={fieldErrors}
      refViewId={refViewId}
      refUrl={ref}
    />
  );
};
