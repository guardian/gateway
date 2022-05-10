import { NameFieldErrors } from '@/shared/model/Errors';
import { useState, useEffect } from 'react';

/**
 * Utility hook to show the global name input field error on submit only.
 *
 * Usage:
 * When your form is submitted, call `setFormSubmitted(true)`.
 * Error field value and context will be set as long as `groupError` is true.
 *
 * When `groupError` is set to `false`, `formSubmitted` is also set to `false`—
 * this is so the global error will not show again until the next submit attempt.
 */
export const useNameInputFieldError = () => {
  const [groupError, setGroupError] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // We show a global name field error above the fold on submit if the form is submitted without one — or both — of the name fields
  // When the user corrects the global error, this effect resets the flag so it does not show again until the next submit attempt.
  useEffect(() => {
    if (groupError === false) {
      setFormSubmitted(false);
    }
  }, [groupError, setFormSubmitted]);

  const showNameFieldError = formSubmitted && groupError;

  const nameFieldError = showNameFieldError
    ? NameFieldErrors.INFORMATION_MISSING
    : undefined;

  const nameFieldErrorContext = showNameFieldError
    ? 'Please enter your First name and Last name'
    : undefined;

  return {
    nameFieldError,
    nameFieldErrorContext,
    setGroupError,
    setFormSubmitted,
  };
};
