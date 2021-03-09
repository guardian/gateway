import { ClientState } from '@/shared/model/ClientState';
import { Routes } from '@/shared/model/Routes';
import React, { useContext } from 'react';
import { ClientStateContext } from '../components/ClientState';
import { CsrfFormField } from '../components/CsrfFormField';

export const ConsentsFollowUp = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const newsletters = clientState?.pageData?.newsletters ?? [];
  return (
    <>
      <p>hello</p>
      <form
        action={`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP}`}
        method="post"
      >
        <CsrfFormField />
      </form>
    </>
  );
};
