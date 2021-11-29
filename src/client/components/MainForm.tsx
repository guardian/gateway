import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import { Button } from '@guardian/source-react-components';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { GuardianTerms, RecaptchaTerms } from '@/client/components/Terms';
import { space } from '@guardian/source-foundations';
import { buttonStyles } from '@/client/layouts/Main';

interface Props {
  formAction: string;
  submitButtonText: string;
  submitButtonPriority?: 'primary' | 'tertiary';
  submitButtonHalfWidth?: boolean;
  // TODO: fully implement recaptcha, it currently only displays terms
  useRecaptcha?: boolean;
  hasGuardianTerms?: boolean;
  onSubmitOverride?: React.FormEventHandler<HTMLFormElement>;
}

const formStyles = css`
  margin-top: 16px;
`;

const inputStyles = (hasTerms = false) => css`
  ${hasTerms &&
  css`
    margin-bottom: ${space[2]}px;
  `}
`;

export const inputMarginBottomSpacingStyle = css`
  margin-bottom: ${space[3]}px;
`;

export const belowFormMarginTopSpacingStyle = css`
  margin-top: ${space[6]}px;
`;

export const MainForm = ({
  children,
  formAction,
  submitButtonText,
  submitButtonPriority = 'primary',
  submitButtonHalfWidth,
  useRecaptcha = false,
  hasGuardianTerms = false,
  onSubmitOverride,
}: PropsWithChildren<Props>) => {
  const hasTerms = useRecaptcha || hasGuardianTerms;

  return (
    <form
      css={formStyles}
      method="post"
      action={formAction}
      onSubmit={onSubmitOverride}
    >
      <CsrfFormField />
      <div css={inputStyles(hasTerms)}>{children}</div>
      {hasGuardianTerms && <GuardianTerms />}
      {useRecaptcha && <RecaptchaTerms />}
      <Button
        css={buttonStyles({ hasTerms, halfWidth: submitButtonHalfWidth })}
        type="submit"
        priority={submitButtonPriority}
        data-cy="main-form-submit-button"
      >
        {submitButtonText}
      </Button>
    </form>
  );
};
