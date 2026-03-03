/**
 * Escapes special regex characters in a string so it can be safely used
 * in a `new RegExp()` constructor for matching.
 */
export const escapeRegExp = (s: string) =>
	s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
