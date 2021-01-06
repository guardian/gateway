import Bowser from 'bowser';

export const getBrowserNameFromUserAgent = (userAgent: string | undefined) => {
  try {
    const browser = Bowser.getParser(userAgent ?? '');
    return browser.getBrowserName(false);
  } catch {
    return '';
  }
};
