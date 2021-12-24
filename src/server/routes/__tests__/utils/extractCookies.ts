/**
 * Format the cookie flags
 *
 * @example
 * ```
 * { Path: '/', Secure: true, SameSite: 'Lax' }
 * ```
 */
const shapeFlags = (flags: Array<string>) =>
  flags.reduce((shapedFlags, flag) => {
    const [flagName, rawValue] = flag.split('=');
    // edge case where a cookie has a single flag and "; " split results in trailing ";"
    const value = rawValue ? rawValue.replace(';', '') : true;
    return { ...shapedFlags, [flagName]: value };
  }, {});

/**
 * The interface for structure in which a cookie is
 * returned by `extractCookies`
 */
interface ExtractedCookie {
  value: string;
  flags: Record<string, string | boolean | number>;
}

/**
 * Extract cookies from headers
 *
 * @param headers The headers of the response
 *
 * @reference https://gist.github.com/the-vampiire/a564af41ed0ce8eb7c30dbe6c0f627d8
 */
export const extractCookies = (
  headers: Record<string, string | Array<string | number>>,
): Record<string, ExtractedCookie> => {
  const cookies = headers['set-cookie'] as Array<string>;

  return cookies.reduce((shapedCookies, cookieString) => {
    const [rawCookie, ...flags] = cookieString.split('; ');
    const [cookieName, value] = rawCookie.split('=');
    return {
      ...shapedCookies,
      [cookieName]: { value, flags: shapeFlags(flags) },
    };
  }, {});
};
