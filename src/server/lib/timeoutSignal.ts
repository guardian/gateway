/**
 * @name timeoutSignal
 * @description Creates a signal that will abort a fetch request after a given timeout in ms (milliseconds)
 *
 * ```ts
 * try {
 *  const response = await fetch(url, { signal: timeoutSignal(250) });
 * } catch (error) {
 *  if (error.name === 'AbortError') {
 *    // handle timeout
 *  }
 * }
 * ```
 *
 * @param timeout The timeout in ms (milliseconds)
 * @returns AbortSignal
 */
export const timeoutSignal = (timeout: number): AbortSignal => {
	const controller = new AbortController();
	setTimeout(() => controller.abort(), timeout);
	return controller.signal;
};
