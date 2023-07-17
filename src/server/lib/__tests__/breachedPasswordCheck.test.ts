import { isBreachedPassword } from '../breachedPasswordCheck';

// mocked trackMetric
jest.mock('@/server/lib/trackMetric', () => ({
	trackMetric: jest.fn(),
}));

// mocked logger
jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		warn: jest.fn(),
	},
}));

const mockedFetch = jest.spyOn(global, 'fetch');

/* eslint-disable @typescript-eslint/no-explicit-any */
const text = jest.fn() as jest.MockedFunction<any>;

describe('lib#breachedPasswordCheck', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('isBreachedPassword should return true if common/breached password', async () => {
		text.mockResolvedValueOnce(`
      1C12D46C02461550809D10EF62DDEE99F75:2
      1CB7055517A54D1B0F1847EB84904E69438:2
      1CC93AEF7B58A1B631CB55BF3A3A3750285:3
      1D2DA4053E34E76F6576ED1DA63134B5E2A:2
      1D72CD07550416C216D8AD296BF5C0AE8E0:10
      1DE027315DE413921A63F1700938AF80965:1
      1E2AAA439972480CEC7F16C795BBB429372:1
      1E3687A61BFCE35F69B7408158101C8E414:1
      1E4C9B93F3F0682250B6CF8331B7EE68FD8:3861493
    `);
		mockedFetch.mockReturnValueOnce(
			Promise.resolve({ ok: true, status: 200, text } as Response),
		);

		const breached = await isBreachedPassword('password');
		expect(breached).toEqual(true);
	});

	test('isBreachedPassword should return false if not common/breached password', async () => {
		text.mockResolvedValueOnce(`
      1C12D46C02461550809D10EF62DDEE99F75:2
      1CB7055517A54D1B0F1847EB84904E69438:2
      1CC93AEF7B58A1B631CB55BF3A3A3750285:3
      1D2DA4053E34E76F6576ED1DA63134B5E2A:2
      1D72CD07550416C216D8AD296BF5C0AE8E0:10
      1DE027315DE413921A63F1700938AF80965:1
      1E2AAA439972480CEC7F16C795BBB429372:1
      1E3687A61BFCE35F69B7408158101C8E414:1
    `);
		mockedFetch.mockReturnValueOnce(
			Promise.resolve({ ok: true, status: 200, text } as Response),
		);

		const breached = await isBreachedPassword('password');
		expect(breached).toEqual(false);
	});

	test('isBreachedPassword should return false if status not 200', async () => {
		mockedFetch.mockReturnValueOnce(
			Promise.resolve({ ok: true, status: 500 } as Response),
		);

		const breached = await isBreachedPassword('password');
		expect(breached).toEqual(false);
	});
});
