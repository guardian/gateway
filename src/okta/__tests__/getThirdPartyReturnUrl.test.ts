import { getThirdPartyReturnUrl } from '../lib/helper';

describe('getThirdPartyReturnUrl', () => {
	it('should return undefined if no label is passed - identity classic', () => {
		expect(
			getThirdPartyReturnUrl('https://profile.theguardian.com', { target: {} }),
		).toBeUndefined();
	});

	it('should return the third party return url if it is passed - identity classic', () => {
		expect(
			getThirdPartyReturnUrl('https://profile.theguardian.com', {
				target: { label: 'jobs_site' },
			}),
		).toEqual('https%3A%2F%2Fjobs.theguardian.com');
	});

	it('should return undefined if no label is passed - identity engine', () => {
		expect(
			getThirdPartyReturnUrl('https://profile.theguardian.com', { app: {} }),
		).toBeUndefined();
		expect(
			getThirdPartyReturnUrl('https://profile.theguardian.com', {
				app: { value: {} },
			}),
		).toBeUndefined();
	});

	it('should return the third party return url if it is passed - identity engine', () => {
		expect(
			getThirdPartyReturnUrl('https://profile.theguardian.com', {
				app: { value: { label: 'jobs_site' } },
			}),
		).toEqual('https%3A%2F%2Fjobs.theguardian.com');
	});
});
