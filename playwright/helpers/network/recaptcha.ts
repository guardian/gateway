/* eslint-disable functional/immutable-data --- only used for playwright test setup */
import { Page } from '@playwright/test';

interface WindowWIthGrecaptcha {
	grecaptcha?: unknown;
}

export const mockClientRecaptcha = async (page: Page) => {
	await page.addInitScript(() => {
		const FAKE_TOKEN = 'fake-recaptcha-token';

		(window as WindowWIthGrecaptcha).grecaptcha = {
			ready: (callback: () => void) => callback(),
			render: (
				element: string | HTMLElement,
				options: { callback?: (token: string) => void },
			) => {
				(
					window as typeof window & {
						_recaptchaCallback?: (token: string) => void;
					}
				)._recaptchaCallback = options.callback;

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
				// Set the token value in the hidden input
				const input = document.getElementById(
					'g-recaptcha-response',
				) as HTMLTextAreaElement | null;
				if (input) {
					input.value = FAKE_TOKEN;
				}

				const callback = (
					window as typeof window & {
						_recaptchaCallback?: (token: string) => void;
					}
				)._recaptchaCallback;
				if (callback) {
					callback(FAKE_TOKEN);
				}
			},
		};
	});

	await page.route(/.google\.com\/recaptcha\/./, async (route) => {
		// Return an empty script instead of blocking entirely
		// This prevents errors from failed script loads
		await route.fulfill({
			status: 200,
			contentType: 'application/javascript',
			body: '// reCAPTCHA script blocked for testing',
		});
	});
	await page.route(/.gstatic\.com\/recaptcha\/./, async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/javascript',
			body: '// reCAPTCHA script blocked for testing',
		});
	});
};
