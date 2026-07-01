import { read } from '@/server/lib/idapi/newsletters';
import { idapiFetch } from '@/server/lib/IDAPIFetch';
import { IdapiError } from '@/server/models/Error';

jest.mock('@/server/lib/IDAPIFetch', () => ({
	idapiFetch: jest.fn(),
	APIGetOptions: jest.fn(() => ({})),
}));

jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		error: jest.fn(),
	},
}));

const mockIdapiFetch = idapiFetch as jest.Mock;

describe('idapi newsletters calls', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('read', () => {
		it('calls idapiFetch with /newsletters-v2', async () => {
			mockIdapiFetch.mockResolvedValue([]);

			await read();

			expect(mockIdapiFetch).toHaveBeenCalledWith(
				expect.objectContaining({ path: '/newsletters-v2' }),
			);
		});

		it('maps listId to newsletter id', async () => {
			mockIdapiFetch.mockResolvedValue([
				{
					id: 'morning-briefing-uk',
					name: 'Morning Briefing',
					theme: 'news',
					frequency: 'Every weekday',
					signUpDescription: 'Start your day with the top stories.',
					signUpEmbedDescription: 'Embed description.',
					listId: 4151,
				},
			]);

			const result = await read();

			expect(result[0].id).toBe('4151');
			expect(result[0].nameId).toBe('morning-briefing-uk');
		});

		it('uses signUpDescription as description when available', async () => {
			mockIdapiFetch.mockResolvedValue([
				{
					id: 'morning-briefing-uk',
					name: 'Morning Briefing',
					theme: 'news',
					frequency: 'Every weekday',
					signUpDescription: 'Primary description',
					signUpEmbedDescription: 'Embed description',
					listId: 4151,
				},
			]);

			const result = await read();

			expect(result[0].description).toBe('Primary description');
		});

		it('falls back to signUpEmbedDescription when signUpDescription is null', async () => {
			mockIdapiFetch.mockResolvedValue([
				{
					id: 'morning-briefing-uk',
					name: 'Morning Briefing',
					theme: 'news',
					frequency: 'Every weekday',
					signUpDescription: null,
					signUpEmbedDescription: 'Embed fallback description',
					listId: 4151,
				},
			]);

			const result = await read();

			expect(result[0].description).toBe('Embed fallback description');
		});

		it('uses empty string when both signUpDescription and signUpEmbedDescription are null', async () => {
			mockIdapiFetch.mockResolvedValue([
				{
					id: 'morning-briefing-uk',
					name: 'Dobedo Newsletter',
					theme: 'news',
					frequency: 'Every weekday',
					signUpDescription: null,
					signUpEmbedDescription: null,
					listId: 4151,
				},
			]);

			const result = await read();

			expect(result[0].description).toBe('');
		});

		it('maps all fields correctly', async () => {
			mockIdapiFetch.mockResolvedValue([
				{
					id: 'morning-briefing-uk',
					name: 'Morning Briefing',
					theme: 'news',
					frequency: 'Every weekday',
					signUpDescription: 'Start your day with the top stories.',
					signUpEmbedDescription: 'Embed description.',
					listId: 4151,
				},
			]);

			const result = await read();

			expect(result[0]).toEqual({
				id: '4151',
				nameId: 'morning-briefing-uk',
				name: 'Morning Briefing',
				description: 'Start your day with the top stories.',
				frequency: 'Every weekday',
			});
		});

		it('throws an IdapiError when idapiFetch fails', async () => {
			mockIdapiFetch.mockRejectedValue(new Error('Network error'));

			await expect(read()).rejects.toThrow(IdapiError);
		});
	});
});
