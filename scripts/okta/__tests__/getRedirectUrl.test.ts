import { getRedirectUrl } from '../lib/helper';

describe('getRedirectUrl', () => {
  it('should return /signin if no valid params passed', () => {
    expect(getRedirectUrl('', '', '', {})).toBe(`/signin?`);
  });

  it('should return /welcome/:token if no valid params passed but the activation_token', () => {
    expect(getRedirectUrl('?activation_token=123', '', '', {})).toBe(
      `/welcome/123?`,
    );
  });

  it('should return /signin with valid query params', () => {
    expect(
      getRedirectUrl('', '', '', {
        getRequestContext: () => ({
          target: {
            clientId: 'test123',
            label: 'testabc',
          },
        }),
        getSignInWidgetConfig: () => ({
          relayState: '/testFromURI',
        }),
      }),
    ).toBe('/signin?fromURI=%2FtestFromURI&appClientId=test123');
  });

  it('should return /welcome/:token with valid query params and activation_token', () => {
    expect(
      getRedirectUrl('?activation_token=123', '', '', {
        getRequestContext: () => ({
          target: {
            clientId: 'test123',
            label: 'testabc',
          },
        }),
        getSignInWidgetConfig: () => ({
          relayState: '/testFromURI',
        }),
      }),
    ).toBe('/welcome/123?fromURI=%2FtestFromURI&appClientId=test123');
  });

  it('should return /signin with valid query params and third party return url and third party client id', () => {
    expect(
      getRedirectUrl('', 'https://profile.theguardian.com', '', {
        getRequestContext: () => ({
          target: {
            clientId: 'test123',
            label: 'jobs_site',
          },
        }),
        getSignInWidgetConfig: () => ({
          relayState: '/testFromURI',
        }),
      }),
    ).toBe(
      '/signin?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
    );
  });

  it('should return /welcome/:token with valid query params and third party return url and third party client id', () => {
    expect(
      getRedirectUrl(
        '?activation_token=123',
        'https://profile.theguardian.com',
        '',
        {
          getRequestContext: () => ({
            target: {
              clientId: 'test123',
              label: 'jobs_site',
            },
          }),
          getSignInWidgetConfig: () => ({
            relayState: '/testFromURI',
          }),
        },
      ),
    ).toBe(
      '/welcome/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
    );
  });

  it('should return /signin only with clientId if force_fallback is set', () => {
    expect(
      getRedirectUrl(
        '?force_fallback=true&client_id=test123',
        'https://profile.theguardian.com',
        '',
        {
          getRequestContext: () => ({
            target: {
              clientId: 'test123',
              label: 'jobs_site',
            },
          }),
          getSignInWidgetConfig: () => ({
            relayState: '/testFromURI',
          }),
        },
      ),
    ).toBe('/signin?appClientId=test123');
  });

  it('should return /welcome/:token only with clientId if force_fallback is set', () => {
    expect(
      getRedirectUrl(
        '?force_fallback=true&client_id=test123&activation_token=123',
        'https://profile.theguardian.com',
        '',
        {
          getRequestContext: () => ({
            target: {
              clientId: 'test123',
              label: 'jobs_site',
            },
          }),
          getSignInWidgetConfig: () => ({
            relayState: '/testFromURI',
          }),
        },
      ),
    ).toBe('/welcome/123?appClientId=test123');
  });

  it('should get fromURI from location and queryparams if path starts with /oauth2/ and fromURI is not in the okta config', () => {
    expect(
      getRedirectUrl(
        '?client_id=test123&prompt=login',
        'https://profile.theguardian.com',
        '/oauth2/v1/authorize',
        {
          getRequestContext: () => ({
            target: {
              clientId: 'test123',
              label: 'jobs_site',
            },
          }),
          getSignInWidgetConfig: () => ({}),
        },
      ),
    ).toBe(
      '/signin?fromURI=%2Foauth2%2Fv1%2Fauthorize%3Fclient_id%3Dtest123&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
    );
  });
});
