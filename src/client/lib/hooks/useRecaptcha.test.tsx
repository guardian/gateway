/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react-hooks';

import type { RenderOptions } from './useRecaptcha';
import useRecaptcha from './useRecaptcha';

const validRecaptchaScriptUrl =
  'https://www.google.com/recaptcha/api.js?render=explicit';
const invalidRecaptchaScriptUrl = 'bad-url';

// Used to mock the `load` and `error` events for scripts so the @guardian/libs `loadScript` method functions as intended.
// Based on the original technique used on line 10 of https://github.com/guardian/libs/blob/main/src/loadScript.test.ts
// when we detect that a script has been added to the DOM:
// - if the src is the recaptcha script, trigger a load event
// - if the src is not the recaptcha script, trigger an error event
new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((addedNode) => {
      if (addedNode.nodeName === 'SCRIPT') {
        const addedScript = addedNode as HTMLScriptElement;

        if (addedScript.src.includes(validRecaptchaScriptUrl)) {
          addedNode.dispatchEvent(new Event('load'));
        }

        if (addedScript.src.includes(invalidRecaptchaScriptUrl)) {
          addedNode.dispatchEvent(new Event('error'));
        }
      }
    });
  });
}).observe(document.body, {
  childList: true,
});

beforeEach(() => {
  // Define grecpatcha on the window object so we can mock it.
  Object.defineProperty(global.window, 'grecaptcha', {
    configurable: true,
    get() {
      return this.stored_x;
    },
  });

  // Set up test so a script is on the body so we can mock the loadScript method from @guardian/libs.
  document.body.setAttribute('innerHTML', '');
  document.body.appendChild(document.createElement('script'));
});

test('should expect an empty token on successful initial load of useRecaptcha', async () => {
  // Mock the Google Recaptcha object
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');
  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();
  const mockedGrecaptchaExecute = jest.fn();

  // Begin test.
  const { result, waitFor } = renderHook(() =>
    useRecaptcha('public-recaptcha-token', 'render-element'),
  );

  // Simulate the grecaptcha object loading in after the hook is executed.
  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecute,
    reset: mockedGrecaptchaReset,
  }));

  // Mock recaptcha calling the ready callback once instantiated.
  await waitFor(() => {
    expect(mockedGrecaptchaReady).toHaveBeenCalled();
    const setCaptchaReadyState = mockedGrecaptchaReady.mock.calls[0][0];
    setCaptchaReadyState();
  });

  // Check that the recaptcha render method was called.
  expect(mockedGrecaptchaRender).toHaveBeenCalledWith(
    'render-element',
    expect.anything(),
  );

  // Check that a recaptcha check hasn't been executed.
  expect(mockedGrecaptchaReset).not.toHaveBeenCalled();
  expect(mockedGrecaptchaExecute).not.toHaveBeenCalled();

  // Make sure no token has been returned and there is no error state.
  expect(result.current.token).toEqual('');
  expect(result.current.error).toEqual(false);
  expect(result.current.expired).toEqual(false);
  expect(result.current.widgetId).toEqual(0);

  windowSpy.mockRestore();
});

test('should receive a valid token back when the reCAPTCHA check is successful', async () => {
  // Mock the Google Recaptcha object
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');
  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();

  // Mock Google Recaptcha calling the success callback with a valid token.
  const mockedGrecaptchaExecute = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];

    renderOptions.callback('valid-token');
  });

  // Begin test.
  const { result, waitFor } = renderHook(() =>
    useRecaptcha('public-recaptcha-token', 'render-element', 'invisible'),
  );

  // Simulate the grecaptcha object loading in after the hook is executed.
  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecute,
    reset: mockedGrecaptchaReset,
  }));

  // Mock recaptcha calling the ready callback once instantiated.
  await waitFor(() => {
    expect(mockedGrecaptchaReady).toHaveBeenCalled();
    const setCaptchaReadyState = mockedGrecaptchaReady.mock.calls[0][0];
    setCaptchaReadyState();
  });

  // Request a token from recaptcha.
  act(() => {
    const captchaExecutionResult = result.current.executeCaptcha();
    expect(captchaExecutionResult).toBe(true);
  });

  // Check that the recaptcha render method was called.
  expect(mockedGrecaptchaRender).toHaveBeenCalledWith(
    'render-element',
    expect.anything(),
  );

  // Check that a recaptcha check has been requested.
  expect(mockedGrecaptchaReset).toHaveBeenCalled();
  expect(mockedGrecaptchaExecute).toHaveBeenCalled();

  // Check that a valid token is returned from successful check.
  expect(result.current.token).toEqual('valid-token');
  expect(result.current.error).toEqual(false);
  expect(result.current.expired).toEqual(false);
  expect(result.current.widgetId).toEqual(0);

  windowSpy.mockRestore();
});

test('should not be able to execute a call to reCAPTCHA if the script has not loaded yet', async () => {
  // Begin test.
  const { result } = renderHook(() =>
    useRecaptcha('public-recaptcha-token', 'render-element'),
  );

  // Request a token from recaptcha.
  act(() => {
    const recaptchaExecutionResult = result.current.executeCaptcha();
    expect(recaptchaExecutionResult).toBe(false);
  });
});

test('should receive an error back when the reCAPTCHA check is unsuccessful', async () => {
  // Mock the Google Recaptcha object and methods.
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');

  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();
  // Mock Google Recaptcha calling the error and expired callback.
  const mockedGrecaptchaExecute = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];

    renderOptions['error-callback'](undefined);
    renderOptions['expired-callback'](undefined);
  });

  // Begin test.
  const { result, waitFor } = renderHook(() =>
    useRecaptcha('public-recaptcha-token', 'render-element', 'invisible'),
  );

  // Simulate the grecaptcha object loading in after the hook is executed.
  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecute,
    reset: mockedGrecaptchaReset,
  }));

  // Simulate recaptcha calling the "ready" callback once instantiated.
  await waitFor(() => {
    expect(mockedGrecaptchaReady).toHaveBeenCalled();
    const setCaptchaReadyState = mockedGrecaptchaReady.mock.calls[0][0];
    setCaptchaReadyState();
  });

  // Request a token from recaptcha.
  act(() => {
    result.current.executeCaptcha();
  });

  // Check that the recaptcha render method was called.
  expect(mockedGrecaptchaRender).toHaveBeenCalledWith(
    'render-element',
    expect.anything(),
  );

  // Check that a recaptcha check has been requested.
  expect(mockedGrecaptchaReset).toHaveBeenCalled();
  expect(mockedGrecaptchaExecute).toHaveBeenCalled();

  // Check that no token was returned and errors indicate an unsuccessful check.
  expect(result.current.token).toEqual('');
  expect(result.current.error).toEqual(true);
  expect(result.current.expired).toEqual(true);
  expect(result.current.widgetId).toEqual(0);

  windowSpy.mockRestore();
});

test('should not load and intialise the Google reCAPTCHA script again if the hook is used twice', async () => {
  // Begin test.
  // Mock the Google Recaptcha object
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');
  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();
  const mockedGrecaptchaExecute = jest.fn();

  // Begin test.
  const { result, waitFor } = renderHook(() =>
    useRecaptcha('public-recaptcha-token', 'render-element'),
  );

  // Make sure that only one recaptcha script has been loaded.
  expect(
    document.querySelectorAll("script[id='g-captcha-script']").length,
  ).toEqual(1);

  // Simulate the grecaptcha object loading in after the hook is executed.
  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecute,
    reset: mockedGrecaptchaReset,
  }));

  // Mock recaptcha calling the ready callback once instantiated.
  await waitFor(() => {
    expect(mockedGrecaptchaReady).toHaveBeenCalled();
    const setCaptchaReadyState = mockedGrecaptchaReady.mock.calls[0][0];
    setCaptchaReadyState();
  });

  // Check that the recaptcha render method was called.
  expect(mockedGrecaptchaRender).toHaveBeenCalledWith(
    'render-element',
    expect.anything(),
  );

  expect(result.current.token).toEqual('');

  // Second use of the hook //
  // This time, the hook will check for the existing instance of recaptcha.
  const { result: secondInstantiation } = renderHook(() =>
    useRecaptcha('public-recaptcha-token', 'render-element-2'),
  );

  // Check that the recaptcha render method was called.
  expect(mockedGrecaptchaRender).toHaveBeenCalledWith(
    'render-element-2',
    expect.anything(),
  );

  expect(secondInstantiation.current.token).toEqual('');
  expect(secondInstantiation.current.error).toEqual(false);
  expect(secondInstantiation.current.expired).toEqual(false);
  expect(secondInstantiation.current.widgetId).toEqual(0);

  // Make sure that only one recaptcha script has been loaded after running the hook twice.
  expect(
    document.querySelectorAll("script[id='g-captcha-script']").length,
  ).toEqual(1);

  windowSpy.mockRestore();
});

test('should expect an error state when the Google reCAPTCHA script fails to load', async () => {
  // Mock the Google Recaptcha object
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');
  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();
  const mockedGrecaptchaExecute = jest.fn();

  // Deliberately set an invalid URL to check error state.
  const { result, waitForNextUpdate } = renderHook(() =>
    useRecaptcha(
      'public-recaptcha-token',
      'render-element',
      'invisible',
      invalidRecaptchaScriptUrl,
    ),
  );

  // Final init of grecaptcha object mocking.
  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecute,
    reset: mockedGrecaptchaReset,
  }));

  await waitForNextUpdate();

  expect(result.current.error).toBe(true);

  windowSpy.mockRestore();
});

test('should expect an error state when no siteToken is provided', async () => {
  const { result } = renderHook(() => useRecaptcha('', 'element-id'));

  expect(result.current.token).toBe('');
  expect(result.current.error).toBe(true);
});

test('should expect an error state when no renderElement is provided', async () => {
  const { result } = renderHook(() => useRecaptcha('valid-site-key', ''));

  expect(result.current.token).toBe('');
  expect(result.current.error).toBe(true);
});

test('should try again successfully after an unsuccessful reCAPTCHA check and receive a valid token on the second attempt', async () => {
  // Mock the Google Recaptcha object and methods.
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');

  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();

  // Mock Google Recaptcha calling the error and expired callback.
  const mockedGrecaptchaExecuteError = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];

    renderOptions['error-callback'](undefined);
    renderOptions['expired-callback'](undefined);
  });

  // Begin test.
  const { result, waitFor } = renderHook(() =>
    useRecaptcha('public-recaptcha-token', 'render-element', 'invisible'),
  );

  // Simulate the grecaptcha object loading in after the hook is executed.
  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecuteError,
    reset: mockedGrecaptchaReset,
  }));

  // Simulate recaptcha calling the "ready" callback once instantiated.
  await waitFor(() => {
    expect(mockedGrecaptchaReady).toHaveBeenCalled();
    const setCaptchaReadyState = mockedGrecaptchaReady.mock.calls[0][0];
    setCaptchaReadyState();
  });

  // Request a token from recaptcha.
  act(() => {
    result.current.executeCaptcha();
  });

  expect(mockedGrecaptchaReset).toHaveBeenCalled();
  expect(mockedGrecaptchaExecuteError).toHaveBeenCalled();

  // Check that expected token is returned.
  expect(result.current.token).toEqual('');
  expect(result.current.error).toEqual(true);
  expect(result.current.expired).toEqual(true);
  expect(result.current.widgetId).toEqual(0);

  // Mock Google Recaptcha calling the success callback with a valid token.
  const mockedGrecaptchaExecuteSuccess = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];

    renderOptions.callback('valid-token');
  });

  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecuteSuccess,
    reset: mockedGrecaptchaReset,
  }));

  // Request a token from recaptcha.
  act(() => {
    result.current.executeCaptcha();
  });

  expect(mockedGrecaptchaReset).toHaveBeenCalledTimes(2);
  expect(mockedGrecaptchaExecuteSuccess).toHaveBeenCalled();

  // Check that expected token is returned.
  expect(result.current.token).toEqual('valid-token');
  expect(result.current.error).toEqual(false);
  expect(result.current.expired).toEqual(false);
  expect(result.current.widgetId).toEqual(0);

  windowSpy.mockRestore();
});
