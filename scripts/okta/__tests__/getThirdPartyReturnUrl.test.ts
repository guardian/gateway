import { getThirdPartyReturnUrl } from '../lib/helper';

describe('getThirdPartyReturnUrl', () => {
	it('should return undefined if no context is passed', () => {
		expect(
			getThirdPartyReturnUrl('https://profile.theguardian.com'),
		).toBeUndefined();
	});

	it('should return undefined if no target is passed', () => {
		expect(
			getThirdPartyReturnUrl('https://profile.theguardian.com', {}),
		).toBeUndefined();
	});

	it('should return undefined if no label is passed', () => {
		expect(
			getThirdPartyReturnUrl('https://profile.theguardian.com', { target: {} }),
		).toBeUndefined();
	});

	it('should return the third party return url if it is passed', () => {
		expect(
			getThirdPartyReturnUrl('https://profile.theguardian.com', {
				target: { label: 'jobs_site' },
			}),
		).toEqual('https%3A%2F%2Fjobs.theguardian.com');
	});
});
