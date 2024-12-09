import Bowser from 'bowser';
import { getIsNativeAppFromBowser } from '../lib/appNameUtils';

describe('appNameUtils', () => {
	describe('getIsNativeAppFromBowser', () => {
		test('returns android if the browser is Android', () => {
			const chrome = Bowser.getParser(
				`Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.104 Mobile Safari/537.36`,
			);
			const firefox = Bowser.getParser(
				`Mozilla/5.0 (Android 15; Mobile; rv:68.0) Gecko/68.0 Firefox/133.0`,
			);
			expect(getIsNativeAppFromBowser(chrome)).toEqual('android');
			expect(getIsNativeAppFromBowser(firefox)).toEqual('android');
		});

		test('returns ios if the browser is iOS', () => {
			const safari = Bowser.getParser(
				`Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1`,
			);
			const chrome = Bowser.getParser(
				`Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/132.0.6834.31 Mobile/15E148 Safari/604.1`,
			);
			const firefox = Bowser.getParser(
				`Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/133.0 Mobile/15E148 Safari/605.1.15`,
			);

			expect(getIsNativeAppFromBowser(safari)).toEqual('ios');
			expect(getIsNativeAppFromBowser(chrome)).toEqual('ios');
			expect(getIsNativeAppFromBowser(firefox)).toEqual('ios');
		});

		test('returns undefined if the browser is not a native app', () => {
			const macOsSafari = Bowser.getParser(
				`Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15`,
			);
			const win10Chrome = Bowser.getParser(
				`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36`,
			);
			const linuxFirefox = Bowser.getParser(
				`Mozilla/5.0 (X11; Linux i686; rv:133.0) Gecko/20100101 Firefox/133.0`,
			);

			expect(getIsNativeAppFromBowser(macOsSafari)).toBeUndefined();
			expect(getIsNativeAppFromBowser(win10Chrome)).toBeUndefined();
			expect(getIsNativeAppFromBowser(linuxFirefox)).toBeUndefined();
		});
	});
});
