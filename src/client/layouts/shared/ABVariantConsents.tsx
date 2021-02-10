import { useAB } from '@guardian/ab-react';
import React, { FunctionComponent } from 'react';
import { ConsentsLayout } from '../ConsentsLayout';
import { ConsentsLayoutABVariant } from '../ConsentsLayoutABVariant';
import { ConsentsContent, CONSENTS_MAIN_COLOR } from './Consents';
interface props {
  children?: React.ReactNode;
  current?: string;
  title: string;
}
export const ABVariantLayout: FunctionComponent<props> = ({
  children,
  current,
  title,
}) => {
  const ABTestAPI = useAB();
  const isUserInTest = ABTestAPI.isUserInVariant(
    'EnhancedConsentTest',
    'variant',
  );
  if (isUserInTest) {
    return (
      <ConsentsLayoutABVariant
        current={current}
        title={title}
        bgColor={CONSENTS_MAIN_COLOR}
      >
        <ConsentsContent>{children}</ConsentsContent>
      </ConsentsLayoutABVariant>
    );
  } else {
    return (
      <ConsentsLayout current={current} title={title}>
        {children}
      </ConsentsLayout>
    );
  }
};
