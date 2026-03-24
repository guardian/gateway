import { getRelayState } from '../lib/helper';

describe('getRelayState', () => {
	it('should return undefined if no relayState is passed', () => {
		expect(getRelayState({})).toBeUndefined();
	});

	it('should return the relayState if it is passed', () => {
		expect(getRelayState({ relayState: 'test' })).toEqual('test');
	});
});
