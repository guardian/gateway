import React from 'react';

export type RenderOptions = {
  sitekey: string;
  size?: string;
  callback: (token: string) => void;
  'error-callback': (token: string) => void;
  'expired-callback': (token: string) => void;
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

export type CaptchaSize = 'invisible' | 'compact' | 'normal';
type UseRecaptcha = (
  siteKey: string,
  renderElement: HTMLDivElement | string,
  size?: CaptchaSize,
) => {
  executeCaptcha: () => void;
  token: string;
  error: boolean;
  expired: boolean;
  widgetId: number;
};

const useRecaptcha: UseRecaptcha = (
  siteKey,
  renderElement,
  size = 'invisible',
) => {
  const [token, setToken] = React.useState('');
  const [error, setError] = React.useState(false);
  const [expired, setExpired] = React.useState(false);
  const [widgetId, setWidgetId] = React.useState(0);

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
          setError(false);
          setExpired(false);
        },
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

export const RecaptchaElement = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function RecaptchaElement(props, ref) {
  return <div ref={ref} className="g-recaptcha" {...props}></div>;
});
