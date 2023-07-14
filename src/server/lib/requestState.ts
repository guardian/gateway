import deepmerge from 'deepmerge';
import { RequestState } from '@/server/models/Express';

/**
 * @name mergeRequestState
 * @description Merges an initial RequestState with a new, partial RequestState. Simply a wrapper
 * around deepmerge but with enforced types, which became necessary when we noticed that for an
 * unknown reason, the TypeScript checker wasn't picking up type errors on usages of vanilla deepmerge.
 * @param initialRequestState A full RequestState object.
 * @param partialRequestState A partial subset of a RequestState object.
 * @returns A full RequestState object.
 */
export const mergeRequestState = (
	initialRequestState: RequestState,
	partialRequestState: Partial<RequestState>,
): RequestState => {
	return deepmerge<RequestState>(initialRequestState, partialRequestState);
};
