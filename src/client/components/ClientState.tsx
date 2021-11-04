import React, { createContext, FunctionComponent } from 'react';
import { ClientState } from '@/shared/model/ClientState';

export const ClientStateContext = createContext<ClientState>({
  clientHosts: { idapiBaseUrl: '', oauthBaseUrl: '' },
  recaptchaConfig: { recaptchaSiteKey: '' },
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
