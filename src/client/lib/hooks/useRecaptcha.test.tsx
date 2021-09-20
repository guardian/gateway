/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react-hooks';
import type { RenderOptions } from './useRecaptcha';
import useRecaptcha from './useRecaptcha';

beforeEach(() => {
  // Define grecpatcha on the window object so we can mock it.
  Object.defineProperty(global.window, 'grecaptcha', {
    configurable: true,
    get() {
      return this.stored_x;
    },
  });
});

test('should load google recaptcha and return an empty token', () => {
  const {
    result: { current },
  } = renderHook(() =>
    useRecaptcha('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', ''),
  );
  const { token } = current;

  expect(token).toBe('');
});

test('should execute a successful captcha check and receive a valid token back', async () => {
  // Mock the Google Recaptcha object
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');
  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();
  // Mock the Google Recaptcha callback when it receives a token.
  const mockedGrecaptchaExecute = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];

    renderOptions.callback('valid-token');
  });

  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecute,
    reset: mockedGrecaptchaReset,
  }));

  const { result } = renderHook(() =>
    useRecaptcha(
      '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
      'captcha-element',
      'invisible',
    ),
  );

  // Request a token from recaptcha.
  act(() => {
    result.current.executeCaptcha();
  });

  expect(mockedGrecaptchaReset).toHaveBeenCalled();
  expect(mockedGrecaptchaExecute).toHaveBeenCalled();
  expect(mockedGrecaptchaReady).not.toHaveBeenCalled();

  expect(mockedGrecaptchaRender).toHaveBeenCalledWith(
    'captcha-element',
    expect.anything(),
  );

  // Check that expected token is returned.
  expect(result.current.token).toEqual('valid-token');
  expect(result.current.error).toEqual(false);
  expect(result.current.expired).toEqual(false);
  expect(result.current.widgetId).toEqual(0);

  windowSpy.mockRestore();
});

test('should execute a captcha check that is unsuccessful and receive an error back', async () => {
  // Mock the Google Recaptcha object and methods.
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');

  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();
  // Mock the Google Recaptcha callback when it receives a token.
  const mockedGrecaptchaExecute = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];

    renderOptions['error-callback'](undefined);
    renderOptions['expired-callback'](undefined);
  });

  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecute,
    reset: mockedGrecaptchaReset,
  }));

  const { result } = renderHook(() =>
    useRecaptcha(
      '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
      'captcha-element',
      'invisible',
    ),
  );

  // Request a token from recaptcha.
  act(() => {
    result.current.executeCaptcha();
  });

  expect(mockedGrecaptchaReset).toHaveBeenCalled();
  expect(mockedGrecaptchaExecute).toHaveBeenCalled();
  expect(mockedGrecaptchaReady).not.toHaveBeenCalled();

  // Check that expected token is returned.
  expect(result.current.token).toEqual('');
  expect(result.current.error).toEqual(true);
  expect(result.current.expired).toEqual(true);
  expect(result.current.widgetId).toEqual(0);

  windowSpy.mockRestore();
});

test('should try again successfully after an unsuccessful query and return a token', async () => {
  // Mock the Google Recaptcha object and methods.
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');

  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();
  // Mock the Google Recaptcha callback when it receives a token.
  const mockedGrecaptchaExecuteError = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];

    renderOptions['error-callback'](undefined);
    renderOptions['expired-callback'](undefined);
  });

  windowSpy.mockImplementation(() => ({
    ready: mockedGrecaptchaReady,
    render: mockedGrecaptchaRender,
    execute: mockedGrecaptchaExecuteError,
    reset: mockedGrecaptchaReset,
  }));

  const { result } = renderHook(() =>
    useRecaptcha(
      '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
      'captcha-element',
      'invisible',
    ),
  );

  // Request a token from recaptcha.
  act(() => {
    result.current.executeCaptcha();
  });

  expect(mockedGrecaptchaReset).toHaveBeenCalled();
  expect(mockedGrecaptchaExecuteError).toHaveBeenCalled();
  expect(mockedGrecaptchaReady).not.toHaveBeenCalled();

  // Check that expected token is returned.
  expect(result.current.token).toEqual('');
  expect(result.current.error).toEqual(true);
  expect(result.current.expired).toEqual(true);
  expect(result.current.widgetId).toEqual(0);

  // Mock the Google Recaptcha callback when it receives a token.
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
  expect(mockedGrecaptchaReady).not.toHaveBeenCalled();

  // Check that expected token is returned.
  expect(result.current.token).toEqual('valid-token');
  expect(result.current.error).toEqual(false);
  expect(result.current.expired).toEqual(false);
  expect(result.current.widgetId).toEqual(0);

  windowSpy.mockRestore();
});
