import { ClientState } from '@/shared/model/ClientState';
import React, { useContext } from 'react';
import { ClientStateContext } from '../components/ClientState';

export const ConsentsFollowUp = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  return <p>hello</p>;
};
