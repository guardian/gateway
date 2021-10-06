import { loadScript } from '@guardian/libs';
import React from 'react';

export type RenderOptions = {
  sitekey: string;
  size?: string;
  callback: (token: string) => void;
  'error-callback': (value: undefined) => void;
  'expired-callback': (value: undefined) => void;
};

export const recaptchaReady = () =>
  typeof window !== 'undefined' &&
  typeof window.grecaptcha !== 'undefined' &&
  typeof window.grecaptcha.render === 'function';

const useRecaptchaScript = (src: string) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  // Only allow the recaptcha script to be added to the page and initialised once.
  React.useEffect(() => {
    const scriptExists =
      typeof document !== undefined &&
      document.getElementById('g-captcha-script') !== null;

    // If the script has been loaded and the recaptcha window object exists, we have no need to continue.
    if (scriptExists && recaptchaReady()) {
      setLoaded(true);
      return;
    }

    // loadScript will prevent scripts from the same src from being loaded twice.
    const recaptchaScriptLoadPromise = loadScript(src, {
      async: true,
      defer: true,
      id: 'g-captcha-script',
    });

    const initialiseRecaptcha = () => {
      // This is the first time the Google Recaptcha script has been added to the page.
      // When the recaptcha script is first loaded, the `.ready` method lets us instantiate it.
      window.grecaptcha.ready(() => {
        if (recaptchaReady()) {
          setLoaded(true);
        }
      });
    };

    recaptchaScriptLoadPromise
      .then(initialiseRecaptcha)
      .catch(() => setError(true));
  }, []);

  return {
    loaded,
    error,
  };
};

type UseRecaptcha = (
  // Public recaptcha site key.
  siteKey: string,
  // Element on the page to load recaptcha into.
  renderElement: HTMLDivElement | string,
  // How the captcha check should display on the page.
  size?: 'invisible' | 'compact' | 'normal',
  // The Google recaptcha script URI.
  src?: string,
) => UseRecaptchaReturnValue;

type UseRecaptchaReturnValue = {
  // Token returned from Google recaptcha upon a successful request.
  // Initial value: ''
  token: string;
  // Error state of the recaptcha request. Set to true upon error callback.
  // Initial value `false`.
  error: boolean;
  // Token expired state of the recaptcha request. Set to true upon expired token callback.
  // Initial value `false`.
  expired: boolean;
  // A shorthand way to refer to the `renderElement` assigned by the recaptcha library.
  // Initial value: 0
  widgetId: number;
  // Ask Google recaptcha for a token and update the token and error state.
  // If successful, `token` is set and `error` + `expired` are reset to false.
  executeCaptcha: () => void;
};

/**
 * Helper hook for Google Recaptcha v2.
 *
 * Provides a simple way to set up and call the recaptcha service when a form validation token is required.
 *
 * @see https://developers.google.com/recaptcha/docs/invisible
 *
 * @param siteKey Public recaptcha site key.
 * @param renderElement Element on the page to bind recaptcha to.
 * @param size optional - How the recaptcha check should display on the page.
 * @param src optional - The Google recaptcha script URI.
 * @returns Recaptcha check state.
 */
const useRecaptcha: UseRecaptcha = (
  siteKey,
  renderElement,
  size = 'invisible',
  src = 'https://www.google.com/recaptcha/api.js?render=explicit',
) => {
  const [token, setToken] = React.useState('');
  const [error, setError] = React.useState(false);
  const [expired, setExpired] = React.useState(false);
  const [widgetId, setWidgetId] = React.useState(0);

  // We can't initialise recaptcha if no site key or render element is provided.
  if (siteKey === '' || renderElement === '') {
    return {
      token,
      error: true,
      expired,
      widgetId,
      executeCaptcha: () => null,
    };
  }

  const { loaded, error: scriptLoadError } = useRecaptchaScript(src);

  // Check if an error occurs whilst loading the recaptcha script.
  React.useEffect(() => {
    if (scriptLoadError) {
      setError(true);
    }
  }, [scriptLoadError]);

  React.useEffect(() => {
    if (loaded) {
      const widgetId = window.grecaptcha.render(renderElement, {
        sitekey: siteKey,
        size: size,
        callback: (token) => {
          setToken(token);
          // Reset error and expiration state when new token successfully received.
          setError(false);
          setExpired(false);
        },
        // Exception callbacks below are called with undefined when a recaptcha error has occured.
        'error-callback': (val) => setError(val === undefined),
        'expired-callback': (val) => setExpired(val === undefined),
      });
      setWidgetId(widgetId);
    }
  }, [loaded]);

  const executeCaptcha = React.useCallback(() => {
    if (recaptchaReady()) {
      window.grecaptcha.reset(widgetId);
      window.grecaptcha.execute(widgetId);
    }
  }, [widgetId]);

  return {
    token,
    error,
    expired,
    widgetId,
    executeCaptcha,
  };
};

export default useRecaptcha;

/**
 * Provides a standardised way to bind Recaptcha to your page.
 */
export const RecaptchaElement = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function RecaptchaElement(props, ref) {
  return <div ref={ref} className="g-recaptcha" {...props}></div>;
});
