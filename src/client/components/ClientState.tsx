import React, { createContext, FunctionComponent } from 'react';
import { ClientState } from '@/shared/model/ClientState';

export const ClientStateContext = createContext<ClientState>({
  clientHosts: { idapiBaseUrl: '', oauthBaseUrl: '' },
  recaptchaConfig: { recaptchaSiteKey: '' },
  sentryConfig: { build: '0', stage: 'DEV', dsn: '' },
  queryParams: {
    returnUrl: 'https://theguardian.com',
  },
});

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
