import { PasswordValidationResult } from '@/shared/lib/PasswordValidation';

export class ThrottledBreachedPasswordCheck {
  checkInterval = 500; //ms
  timeout = 1000; //ms
  timeLastCalled = 0;
  resolvePromiseInProgress: (result: PasswordValidationResult) => void = () => {
    return;
  };

  /**
   * Calls to the breached-count endpoint are throttled according to checkInterval.
   *
   * The returned Promise will resolve early with a common-password validation result if the function is called again with a new password.
   * The caller should confirm the input password has not changed since the promise returned before using the result.
   *
   * VALID_PASSWORD is returned on API error. AJAX errors should not prevent the user entering a new password.
   */
  breachedPasswordCheck(
    idapiBaseUrl: string,
    passwordHash: string,
  ): Promise<PasswordValidationResult> {
    // Resolve the last promise in progress early since we need to check a new password
    this.resolvePromiseInProgress(PasswordValidationResult.COMMON_PASSWORD);

    const timeToWait = Math.max(
      this.checkInterval - (Date.now() - this.timeLastCalled),
      0,
    );

    return new Promise((resolveLocalPromiseInProgress) => {
      // set the promise in progress field so it can be resolved if the function gets called again
      this.resolvePromiseInProgress = resolveLocalPromiseInProgress;

      // breachedPasswordCheck prevents reset password form submission, so we timeout with a valid result
      setTimeout(
        () =>
          resolveLocalPromiseInProgress(
            PasswordValidationResult.VALID_PASSWORD,
          ),
        this.timeout,
      );

      this.wait(timeToWait).then(() => {
        if (resolveLocalPromiseInProgress !== this.resolvePromiseInProgress) {
          // if the local promise in progress has changed, return early to avoid an unnecessary fetch
          return resolveLocalPromiseInProgress(
            PasswordValidationResult.COMMON_PASSWORD,
          );
        }
        this.timeLastCalled = Date.now();

        return window
          .fetch(`${idapiBaseUrl}/password-hash/${passwordHash}/breached-count`)
          .then((r) => r.json())
          .then((breachedCount) => {
            if (breachedCount === 0) {
              return resolveLocalPromiseInProgress(
                PasswordValidationResult.VALID_PASSWORD,
              );
            }
            return resolveLocalPromiseInProgress(
              PasswordValidationResult.COMMON_PASSWORD,
            );
          })
          .catch(() =>
            resolveLocalPromiseInProgress(
              PasswordValidationResult.VALID_PASSWORD,
            ),
          );
      });
    });
  }

  private wait(timeToWait: number) {
    return new Promise<void>((r) => setTimeout(() => r(), timeToWait));
  }
}
