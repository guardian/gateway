import React, {
  createRef,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { css } from '@emotion/react';
import { Button } from '@guardian/source-react-components';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { GuardianTerms, RecaptchaTerms } from '@/client/components/Terms';
import { space } from '@guardian/source-foundations';
import { buttonStyles } from '@/client/layouts/Main';
import {
  RecaptchaWrapper,
  UseRecaptchaReturnValue,
} from '@/client/lib/hooks/useRecaptcha';
import { CaptchaErrors } from '@/shared/model/Errors';
import { DetailedRecaptchaError } from '@/client/components/DetailedRecaptchaError';
import { RefTrackingFormFields } from '@/client/components/RefTrackingFormFields';
import { trackFormFocusBlur, trackFormSubmit } from '@/client/lib/ophan';
import { logger } from '@/client/lib/sentryLogger';

export interface MainFormProps {
  formAction: string;
  submitButtonText: string;
  submitButtonPriority?: 'primary' | 'tertiary';
  submitButtonHalfWidth?: boolean;
  recaptchaSiteKey?: string;
  setRecaptchaErrorMessage?: React.Dispatch<React.SetStateAction<string>>;
  setRecaptchaErrorContext?: React.Dispatch<
    React.SetStateAction<ReactNode | string>
  >;
  hasGuardianTerms?: boolean;
  onSubmitOverride?: React.FormEventHandler<HTMLFormElement>;
  formTrackingName?: string;
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
  recaptchaSiteKey,
  setRecaptchaErrorMessage,
  setRecaptchaErrorContext,
  hasGuardianTerms = false,
  onSubmitOverride,
  formTrackingName,
}: PropsWithChildren<MainFormProps>) => {
  const recaptchaEnabled = !!recaptchaSiteKey;
  const hasTerms = recaptchaEnabled || hasGuardianTerms;

  const formRef = createRef<HTMLFormElement>();
  const [recaptchaState, setRecaptchaState] =
    useState<UseRecaptchaReturnValue>();

  /**
   * Executes the reCAPTCHA check and form submit tracking.
   * Prevents the form from submitting until the reCAPTCHA check is complete.
   */
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (formTrackingName) {
        trackFormSubmit(formTrackingName);
      }

      if (onSubmitOverride) {
        onSubmitOverride(event);
      }

      if (recaptchaEnabled && !recaptchaState?.token) {
        event.preventDefault();
        recaptchaState?.executeCaptcha();
      }
    },
    [onSubmitOverride, recaptchaEnabled, recaptchaState, formTrackingName],
  );

  /**
   * Submits the form once the reCAPTCHA check has been successfully completed.
   */
  useEffect(() => {
    if (recaptchaEnabled) {
      const registerFormElement = formRef.current;
      if (recaptchaState?.token) {
        registerFormElement?.submit();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recaptchaEnabled, recaptchaState, recaptchaState?.token]);

  useEffect(() => {
    if (recaptchaEnabled) {
      // Determine is something went wrong with the check.
      const recaptchaCheckFailed =
        recaptchaState?.error || recaptchaState?.expired;

      if (recaptchaCheckFailed) {
        logger.info('Recaptcha check failed');
      }

      // Used to show a more detailed reCAPTCHA error if
      // the user has requested a check more than once.
      const showErrorContext =
        recaptchaCheckFailed && recaptchaState?.requestCount > 1;

      // Default to generic reCAPTCHA error message.
      // Show the retry message if the user has requested a check more than once.
      const recaptchaErrorMessage = showErrorContext
        ? CaptchaErrors.RETRY
        : CaptchaErrors.GENERIC;

      const recaptchaErrorContext = showErrorContext ? (
        <DetailedRecaptchaError />
      ) : undefined;

      // Pass the error states back to the parent component if setters are provided.
      if (recaptchaCheckFailed && setRecaptchaErrorMessage) {
        setRecaptchaErrorMessage(recaptchaErrorMessage);
      }
      if (showErrorContext && setRecaptchaErrorContext) {
        setRecaptchaErrorContext(recaptchaErrorContext);
      }
    }
  }, [
    recaptchaEnabled,
    recaptchaState,
    recaptchaState?.error,
    recaptchaState?.expired,
    recaptchaState?.requestCount,
    setRecaptchaErrorContext,
    setRecaptchaErrorMessage,
  ]);

  return (
    <form
      css={formStyles}
      method="post"
      action={formAction}
      onSubmit={handleSubmit}
      ref={formRef}
      onFocus={(e) =>
        formTrackingName && trackFormFocusBlur(formTrackingName, e, 'focus')
      }
      onBlur={(e) =>
        formTrackingName && trackFormFocusBlur(formTrackingName, e, 'blur')
      }
    >
      {recaptchaEnabled && (
        <RecaptchaWrapper
          recaptchaSiteKey={recaptchaSiteKey}
          setRecaptchaState={setRecaptchaState}
        />
      )}
      <CsrfFormField />
      <RefTrackingFormFields />
      <div css={inputStyles(hasTerms)}>{children}</div>
      {hasGuardianTerms && <GuardianTerms />}
      {recaptchaEnabled && <RecaptchaTerms />}
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
