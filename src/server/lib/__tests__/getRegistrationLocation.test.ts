import { Request } from 'express';
import { getRegistrationLocation } from '../getRegistrationLocation';

const getFakeRequest = (country?: string, state?: string): Request =>
	({
		headers: {
			'x-gu-geolocation': country,
			'x-gu-geolocation-state': state,
		},
	}) as unknown as Request;

describe('getRegistrationLocation - country only', () => {
	[
		{ input: 'GB', output: 'United Kingdom' },
		{ input: 'US', output: 'United States' },
		{ input: 'AU', output: 'Australia' },
		{ input: 'CA', output: 'Canada' },
		{ input: 'NZ', output: 'New Zealand' },
		{ input: 'FR', output: 'Europe' },
		{ input: 'SA', output: 'Other' },
		{ input: undefined, output: undefined },
		{ input: '', output: undefined },
		{ input: 'foobar', output: undefined },
	].forEach(({ input, output }) => {
		test(`given ${input}, it returns ${output}`, () => {
			const [registrationLocation] = getRegistrationLocation(
				getFakeRequest(input),
			);
			expect(registrationLocation).toBe(output);
		});
	});
});

describe('getRegistrationLocation - country and state', () => {
	[
		{
			inputCountry: 'US',
			inputState: 'CA',
			outputCountry: 'United States',
			outputState: 'California',
		},
		{
			inputCountry: 'AU',
			inputState: 'NSW',
			outputCountry: 'Australia',
			outputState: 'New South Wales',
		},
		{
			inputCountry: 'US',
			inputState: 'foobar',
			outputCountry: 'United States',
			outputState: undefined,
		},
		{
			inputCountry: 'AU',
			inputState: 'foobar',
			outputCountry: 'Australia',
			outputState: undefined,
		},
		{
			inputCountry: 'US',
			inputState: undefined,
			outputCountry: 'United States',
			outputState: undefined,
		},
		{
			inputCountry: 'AU',
			inputState: undefined,
			outputCountry: 'Australia',
			outputState: undefined,
		},
		{
			inputCountry: 'GB',
			inputState: 'foobar',
			outputCountry: 'United Kingdom',
			outputState: undefined,
		},
		{
			inputCountry: 'GB',
			inputState: undefined,
			outputCountry: 'United Kingdom',
			outputState: undefined,
		},
		{
			inputCountry: 'FR',
			inputState: 'foobar',
			outputCountry: 'Europe',
			outputState: undefined,
		},
		{
			inputCountry: 'FR',
			inputState: undefined,
			outputCountry: 'Europe',
			outputState: undefined,
		},
		{
			inputCountry: 'SA',
			inputState: 'foobar',
			outputCountry: 'Other',
			outputState: undefined,
		},
		{
			inputCountry: 'SA',
			inputState: undefined,
			outputCountry: 'Other',
			outputState: undefined,
		},
		{
			inputCountry: undefined,
			inputState: 'CA',
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: undefined,
			inputState: undefined,
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: '',
			inputState: 'CA',
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: '',
			inputState: '',
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: 'foobar',
			inputState: 'CA',
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: 'foobar',
			inputState: 'foobar',
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: 'foobar',
			inputState: undefined,
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: 'foobar',
			inputState: '',
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: 'foobar',
			inputState: 'foobar',
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: 'foobar',
			inputState: 'CA',
			outputCountry: undefined,
			outputState: undefined,
		},
		{
			inputCountry: 'foobar',
			inputState: 'foobar',
			outputCountry: undefined,
			outputState: undefined,
		},
	].forEach(({ inputCountry, inputState, outputCountry, outputState }) => {
		test(`given ${inputCountry} and ${inputState}, it returns ${outputCountry} and ${outputState}`, () => {
			const [registrationLocation, registrationLocationState] =
				getRegistrationLocation(getFakeRequest(inputCountry, inputState));
			expect(registrationLocation).toBe(outputCountry);
			expect(registrationLocationState).toBe(outputState);
		});
	});
});
