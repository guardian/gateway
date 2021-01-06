import { isDisplayEyeOnBrowser } from '@/client/components/PasswordInput';

describe('isDisplayEyeOnBrowser', () => {
  it('returns whether to render the show / hide password eye for different browser names', () => {
    expect(isDisplayEyeOnBrowser('Microsoft Edge')).toBe(false);
    expect(isDisplayEyeOnBrowser('Internet Explorer')).toBe(false);
    expect(isDisplayEyeOnBrowser('Safari')).toBe(false);

    expect(isDisplayEyeOnBrowser('Chrome')).toBe(true);
    expect(isDisplayEyeOnBrowser('Firefox')).toBe(true);
    expect(isDisplayEyeOnBrowser('')).toBe(true);
    expect(isDisplayEyeOnBrowser('unknown')).toBe(true);
    expect(isDisplayEyeOnBrowser(undefined)).toBe(true);
  });
});
