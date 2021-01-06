import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';

describe('getBrowserNameFromUserAgent', () => {
  it('should return a browser name given a user agent', () => {
    expect(
      getBrowserNameFromUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
      ),
    ).toBe('Safari');
    expect(
      getBrowserNameFromUserAgent(
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43',
      ),
    ).toBe('Microsoft Edge');
    expect(
      getBrowserNameFromUserAgent(
        'Mozilla/5.0 CK={} (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
      ),
    ).toBe('Internet Explorer');
    expect(getBrowserNameFromUserAgent('unknown')).toBe('');
    expect(getBrowserNameFromUserAgent(undefined)).toBe('');
  });
});
