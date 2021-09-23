import React from 'react';

export const recaptchaReady = () =>
  typeof window !== 'undefined' &&
  typeof window.grecaptcha !== 'undefined' &&
  typeof window.grecaptcha.render === 'function';

const useRecaptchaScript = (url: string) => {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const existingScript =
      typeof document !== undefined &&
      document.getElementById('g-captcha-script');

    if (existingScript || recaptchaReady()) {
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
      // TODO: Decide whether to remove from body on effect cleanup.
      document.body.removeChild(script);
    };
  }, []);

  return {
    loaded,
  };
};

export const useRecaptcha = (
  siteKey: string,
  renderElement: HTMLDivElement | string | null | undefined,
  size = 'invisible',
) => {
  const [token, setToken] = React.useState('');
  const [error, setError] = React.useState('');
  const [expired, setExpired] = React.useState('');

  const [widgetId, setWidgetId] = React.useState(0);

  const { loaded } = useRecaptchaScript(
    'https://www.google.com/recaptcha/api.js?render=explicit',
  );

  React.useEffect(() => {
    if (loaded && renderElement) {
      const widgetId = window.grecaptcha.render(renderElement, {
        sitekey: siteKey,
        size: size,
        callback: setToken,
        'error-callback': setError,
        'expired-callback': setExpired,
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
