import React, { createContext, FunctionComponent } from 'react';

import { ClientState, defaultClientState } from '@/shared/model/ClientState';

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
