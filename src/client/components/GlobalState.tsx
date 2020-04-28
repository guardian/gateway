import React, { createContext, FunctionComponent } from 'react';
import { GlobalState } from '@/shared/model/GlobalState';

export const GlobalStateContext = createContext({});

type GlobalProps = {
  globalState: GlobalState;
};

export const GlobalStateProvider: FunctionComponent<GlobalProps> = props => {
  return (
    <GlobalStateContext.Provider value={props.globalState}>
      {props.children}
    </GlobalStateContext.Provider>
  );
};
