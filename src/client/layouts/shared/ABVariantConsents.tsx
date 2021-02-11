import {
  gridItem,
  gridItemColumnConsents,
  gridRow,
} from '@/client/styles/Grid';
import { css } from '@emotion/react';
import { useAB } from '@guardian/ab-react';
import { brand, space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { titlepiece } from '@guardian/src-foundations/typography';
import React, { FunctionComponent } from 'react';
import { ConsentsLayout } from '../ConsentsLayout';
import { ConsentsLayoutABVariant } from '../ConsentsLayoutABVariant';
import {
  ConsentsContent,
  ConsentsHeader,
  CONSENTS_MAIN_COLOR,
} from './Consents';
interface LayoutProps {
  children?: React.ReactNode;
  current?: string;
  title: string;
}
export const ABVariantLayout: FunctionComponent<LayoutProps> = ({
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

const consentsBackground = css`
  background-color: ${CONSENTS_MAIN_COLOR};
`;

const blueBorder = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${brand[400]};
    border-right: 1px solid ${brand[400]};
  }
`;

const h1 = css`
  color: ${brand[400]};
  margin: ${space[12]}px 0 ${space[5]}px 0;
  ${titlepiece.small({ fontWeight: 'bold' })};
  font-size: 38px;
  line-height: 1;
  ${gridItem(gridItemColumnConsents)};
  ${from.tablet} {
    ${titlepiece.medium({ fontWeight: 'bold' })};
    font-size: 42px;
  }
  ${from.desktop} {
    ${titlepiece.large({ fontWeight: 'bold' })};
    font-size: 50px;
  }
`;

interface HeaderProps {
  title: string;
}

export const ABVariantHeader: FunctionComponent<HeaderProps> = ({ title }) => {
  const ABTestAPI = useAB();
  const isUserInTest = ABTestAPI.isUserInVariant(
    'EnhancedConsentTest',
    'variant',
  );
  if (!isUserInTest) {
    return <ConsentsHeader title={title} />;
  } else {
    return (
      <header css={consentsBackground}>
        <div css={[gridRow, blueBorder]}>
          <h1 css={h1}>{title}</h1>
        </div>
      </header>
    );
  }
};
