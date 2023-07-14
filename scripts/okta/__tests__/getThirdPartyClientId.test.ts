import { getThirdPartyClientId } from '../lib/helper';

describe('getThirdPartyClientId', () => {
	it('should return undefined if no context is passed', () => {
		expect(getThirdPartyClientId()).toBeUndefined();
	});

	it('should return undefined if no target is passed', () => {
		expect(getThirdPartyClientId({})).toBeUndefined();
	});

	it('should return undefined if no label is passed', () => {
		expect(getThirdPartyClientId({ target: {} })).toBeUndefined();
	});

	it('should return the third party client id if it is passed', () => {
		expect(getThirdPartyClientId({ target: { label: 'jobs_site' } })).toEqual(
			'jobs',
		);
	});
});
