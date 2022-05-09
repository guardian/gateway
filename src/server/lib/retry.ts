interface retryParams<T> {
  fn: () => Promise<T>;
  retriesLeft?: number;
  interval?: number;
  exponential?: boolean;
}

/**
 * Retries the given function until it succeeds given a number of retries and
 * an interval between them. By default, will retry the function 3 times with
 * 500ms in between attempts.
 * Adapted from https://gitlab.com/-/snippets/1775781
 * @param {Function} params.fn - Returns a promise
 * @param {Number} params.retriesLeft - Number of retries. If -1 will keep retrying
 * @param {Number} params.interval - Milliseconds between retries. If exponential is
 * set to true, will be doubled each retry
 * @param {Boolean} params.exponential - Flag for exponential back-off mode
 * @return {Promise<*>}
 */
export default async function retry<T>({
  fn,
  retriesLeft = 3,
  interval = 500,
  exponential = false,
}: retryParams<T>): Promise<T> {
  try {
    const response = await fn();
    return response;
  } catch (error) {
    if (retriesLeft) {
      await new Promise((r) => setTimeout(r, interval));
      return retry({
        fn,
        retriesLeft: retriesLeft - 1,
        interval: exponential ? interval * 2 : interval,
        exponential,
      });
    } else throw new Error(`Max retries reached for function ${fn.name}`);
  }
}
