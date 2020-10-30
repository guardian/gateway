import React, { useContext } from 'react';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';

export const CsrfFormField = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  return <input type="hidden" name="_csrf" value={globalState.csrfToken} />;
};
