// ABTEST: followupConsent: This page is only used as part of the followupConsent abtest.
import { ClientState } from '@/shared/model/ClientState';
import React, { useContext } from 'react';
import { ClientStateContext } from '@/client/components/ClientState';
import { ConsentsFollowUp } from '@/client/pages/ConsentsFollowUp';
import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import { EntityType } from '@/shared/model/Entity';

const decideEntity = (
  newsletters: NewsLetter[],
  consents: Consent[],
): { entity: NewsLetter | Consent; entityType: EntityType } => {
  const newsletter = newsletters[0];
  const consent = consents[0];
  return {
    entity: newsletter || consent,
    entityType: newsletter ? 'newsletter' : 'consent',
  };
};

export const ConsentsFollowUpPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {}, pageData = {} } = clientState;
  const { returnUrl } = pageData;
  const newsletters = clientState?.pageData?.newsletters ?? [];
  const consents = clientState?.pageData?.consents ?? [];
  const { entity, entityType } = decideEntity(newsletters, consents);
  return (
    <ConsentsFollowUp
      returnUrl={returnUrl}
      entity={entity}
      entityType={entityType}
      error={error}
      success={success}
    />
  );
};
