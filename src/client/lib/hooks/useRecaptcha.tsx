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

const useRecaptchaScript = (
  url = 'https://www.google.com/recaptcha/api.js?render=explicit',
) => {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const scriptExists =
      typeof document !== undefined &&
      document.getElementById('g-captcha-script');

    if (scriptExists || recaptchaReady()) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');

    script.setAttribute('src', url);

    script.setAttribute('id', 'g-captcha-script');
    script.setAttribute('async', '');
    script.setAttribute('defer', '');

    document.body.appendChild(script);

    const initialiseRecaptcha = () => {
      window.grecaptcha.ready(() => {
        if (recaptchaReady()) {
          setLoaded(true);
        }
      });
    };
    script.addEventListener('load', initialiseRecaptcha);

    return () => {
      script.removeEventListener('load', initialiseRecaptcha);
      document.body.removeChild(script);
    };
  }, []);
  return {
    loaded,
  };
};

type UseRecaptcha = (
  // Public recaptcha site key.
  siteKey: string,
  // Element on the page to load recaptcha into.
  renderElement: HTMLDivElement | string,
  // How the captcha check should display on the page.
  size?: 'invisible' | 'compact' | 'normal',
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
 * @param renderElement Element on the page to load recaptcha into.
 * @param size How the recaptcha check should display on the page.
 *    @default 'invisible'
 * @returns Recaptcha check state.
 */
const useRecaptcha: UseRecaptcha = (
  siteKey,
  renderElement,
  size = 'invisible',
) => {
  const [token, setToken] = React.useState('');
  const [error, setError] = React.useState(false);
  const [expired, setExpired] = React.useState(false);
  const [widgetId, setWidgetId] = React.useState(0);

  // We can't initialise recaptcha if no site key is provided.
  if (siteKey === '') {
    return {
      token,
      error,
      expired,
      widgetId,
      executeCaptcha: () => null,
    };
  }

  const { loaded } = useRecaptchaScript();

  React.useEffect(() => {
    if (loaded && renderElement) {
      const widgetId = window.grecaptcha.render(renderElement, {
        sitekey: siteKey,
        size: size,
        callback: (token) => {
          setToken(token);
          // Reset exception state when token successfully received.
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
