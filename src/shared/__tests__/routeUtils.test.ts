import { buildUrl } from '@/shared/lib/routeUtils';

describe('routeUtils', () => {
	describe('buildUrl', () => {
		test('generates a typed object from a parameterised path', () => {
			const output = buildUrl('/reset-password/:token', {
				token: 'tokenValue',
			});
			expect(output).toEqual('/reset-password/tokenValue');
		});
		test('generates a typed object from a parameterised path', () => {
			const output = buildUrl('/reset-password/:token', {
				token: 'tokenValue',
			});
			expect(output).toEqual('/reset-password/tokenValue');
		});
		test('a non-parameterised path requires no object', () => {
			const output = buildUrl('/welcome/review');
			expect(output).toEqual('/welcome/review');
		});
	});
});
