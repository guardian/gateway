export const isHttpErrorWithStatus = (
	error: unknown,
	status: number,
): boolean =>
	error instanceof Object && 'status' in error && error.status === status;
