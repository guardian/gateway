import React, { createContext, FunctionComponent } from 'react';
import { ClientState } from '@/shared/model/ClientState';

export const defaultClientState = {
  clientHosts: { idapiBaseUrl: '', oauthBaseUrl: '' },
  recaptchaConfig: { recaptchaSiteKey: '' },
  sentryConfig: { build: '0', stage: 'DEV' as const, dsn: '' },
  queryParams: {
    returnUrl: 'https://theguardian.com',
  },
};

export const ClientStateContext =
  createContext<ClientState>(defaultClientState);

type ClientStateProps = {
  clientState: ClientState;
};

export const ClientStateProvider: FunctionComponent<ClientStateProps> = (
  props,
) => {
  return (
    <ClientStateContext.Provider value={props.clientState}>
      {props.children}
    </ClientStateContext.Provider>
  );
};
