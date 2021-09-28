import { logger } from '@/server/lib/logger';
import React from 'react';

export const recaptchaReady = () =>
  typeof window !== 'undefined' &&
  typeof window.grecaptcha !== 'undefined' &&
  typeof window.grecaptcha.render === 'function';

const useRecaptchaScript = (url: string) => {
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

export const useRecaptcha = (
  siteKey: string,
  renderElement: HTMLDivElement | string,
  size = 'invisible',
) => {
  const [token, setToken] = React.useState('');
  const [error, setError] = React.useState(false);
  const [expired, setExpired] = React.useState(false);
  const [widgetId, setWidgetId] = React.useState(0);

  if (siteKey === '') {
    logger.error('Recaptcha site key not provided');
    return {
      token,
      error,
      expired,
      widgetId,
    };
  }

  const { loaded } = useRecaptchaScript(
    'https://www.google.com/recaptcha/api.js?render=explicit',
  );

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

  return {
    token,
    error,
    expired,
    widgetId,
  };
};

export const RecaptchaElement = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function RecaptchaElement(props, ref) {
  return <div ref={ref} className="g-recaptcha" {...props}></div>;
});
