import React, { createContext, FunctionComponent } from 'react';
import { ClientState } from '@/shared/model/ClientState';

export const ClientStateContext = createContext({
  clientHosts: { idapiBaseUrl: '', oauthBaseUrl: '' },
  recaptchaConfig: { recaptchaSiteKey: '' },
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
