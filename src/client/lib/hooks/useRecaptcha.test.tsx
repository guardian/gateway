/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react-hooks';
import useRecaptcha, { RenderOptions } from './useRecaptcha';

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
  let mockedCaptchaCallback: (token: string) => void;
  windowSpy.mockImplementation(() => ({
    ready: () => null,
    render: (_, options) => {
      mockedCaptchaCallback = options.callback;
      return 0;
    },
    execute: () => {
      if (mockedCaptchaCallback) {
        mockedCaptchaCallback('test-token');
      }
    },
    reset: () => null,
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

  // Check that expected token is returned.
  expect(result.current.token).toEqual('test-token');

  windowSpy.mockRestore();
});

test('should execute an unsuccessful captcha check and receive an error back', async () => {
  // Mock the Google Recaptcha object and methods.
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');

  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn();
  // Mock the Google Recaptcha callback when it receives a token.
  const mockedGrecaptchaExecute = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];

    renderOptions.callback('test-token');
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

  expect(mockedGrecaptchaReset.mock.calls.length).toBe(1);
  expect(mockedGrecaptchaExecute.mock.calls.length).toBe(1);

  // Check that expected token is returned.
  expect(result.current.token).toEqual('test-token');
  expect(result.current.error).toEqual(false);
  expect(result.current.expired).toEqual(false);
  expect(result.current.widgetId).toEqual(0);

  windowSpy.mockRestore();
});
