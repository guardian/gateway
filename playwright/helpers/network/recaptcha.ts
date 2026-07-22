/* eslint-disable functional/immutable-data --- only used for playwright test setup */
import { Page } from '@playwright/test';

interface WindowWIthGrecaptcha {
	grecaptcha?: unknown;
	_recaptchaCallback?: (token: string) => void;
	_recaptchaErrorCallback?: () => void;
	_mockRecaptchaShouldFail?: boolean;
}

export const mockClientRecaptcha = async (page: Page) => {
	await page.addInitScript(() => {
		const FAKE_TOKEN = 'fake-recaptcha-token';

		(window as WindowWIthGrecaptcha).grecaptcha = {
			ready: (callback: () => void) => callback(),
			render: (
				element: string | HTMLElement,
				options: {
					callback?: (token: string) => void;
					'error-callback'?: () => void;
				},
			) => {
				const mockWindow = window as WindowWIthGrecaptcha;
				mockWindow._recaptchaCallback = options.callback;
				mockWindow._recaptchaErrorCallback = options['error-callback'];

				// Create the hidden input that Google reCAPTCHA normally creates
				// This input is submitted with the form as 'g-recaptcha-response'
				const container =
					typeof element === 'string'
						? document.getElementById(element)
						: element;
				if (container) {
					const input = document.createElement('textarea');
					input.name = 'g-recaptcha-response';
					input.id = 'g-recaptcha-response';
					input.style.display = 'none';
					container.appendChild(input);
				}

				return 0;
			},
			reset: () => {},
			execute: () => {
				const mockWindow = window as WindowWIthGrecaptcha;
				if (mockWindow._mockRecaptchaShouldFail) {
					mockWindow._recaptchaErrorCallback?.();
					return;
				}

				// Set the token value in the hidden input
				const input = document.getElementById(
					'g-recaptcha-response',
				) as HTMLTextAreaElement | null;
				if (input) {
					input.value = FAKE_TOKEN;
				}

				const callback = mockWindow._recaptchaCallback;
				if (callback) {
					callback(FAKE_TOKEN);
				}
			},
		};
	});

	await page.route(
		/https:\/\/www\.google\.com\/recaptcha\/./,
		async (route) => {
			// Return an empty script instead of blocking entirely
			// This prevents errors from failed script loads
			await route.fulfill({
				status: 200,
				contentType: 'application/javascript',
				body: '// reCAPTCHA script blocked for testing',
			});
		},
	);
	await page.route(
		/https:\/\/www\.gstatic\.com\/recaptcha\/./,
		async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/javascript',
				body: '// reCAPTCHA script blocked for testing',
			});
		},
	);
};

export const setMockClientRecaptchaShouldFail = async (
	page: Page,
	shouldFail: boolean,
) => {
	await page.evaluate((value) => {
		(window as WindowWIthGrecaptcha)._mockRecaptchaShouldFail = value;
	}, shouldFail);
};
