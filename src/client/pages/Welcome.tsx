import React from 'react';
import { PasswordForm } from '@/client/components/PasswordForm';
import { FieldError } from '@/shared/model/ClientState';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { getAutoRow, passwordFormSpanDef } from '@/client/styles/Grid';
import { controls, text, greyBorderTop } from '@/client/styles/Consents';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import {
  LinkButton,
  SvgArrowRightStraight,
} from '@guardian/source-react-components';

import { css } from '@emotion/react';
import { buildUrl } from '@/shared/lib/routeUtils';
import { space } from '@guardian/source-foundations';

type Props = {
  submitUrl: string;
  email?: string;
  fieldErrors: FieldError[];
  passwordSet?: boolean;
};

const linkButton = css`
  width: 150px;
  margin-top: ${space[3]}px;
`;

const emailSpan = css`
  font-weight: bold;
`;

export const Welcome = ({
  submitUrl,
  email,
  fieldErrors,
  passwordSet = false,
}: Props) => {
  const autoRow = getAutoRow(1, passwordFormSpanDef);

  return (
    <ConsentsLayout
      title="Welcome to the Guardian"
      current={CONSENTS_PAGES.PASSWORD}
      showContinueButton={false}
    >
      <p css={[text, greyBorderTop, autoRow()]}>
        {passwordSet
          ? 'Password already set for '
          : 'Please create a password for '}{' '}
        {<span css={emailSpan}>{email}</span> || 'your new account'}
      </p>
      {passwordSet ? (
        <div css={[controls, autoRow()]}>
          <LinkButton
            css={linkButton}
            href={buildUrl('/consents')}
            priority="primary"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
          >
            Continue
          </LinkButton>
        </div>
      ) : (
        <PasswordForm
          submitUrl={submitUrl}
          fieldErrors={fieldErrors}
          labelText="Password"
          submitButtonText="Create password"
          gridAutoRow={autoRow}
          autoComplete="new-password"
          formTrackingName="welcome"
        />
      )}
    </ConsentsLayout>
  );
};
