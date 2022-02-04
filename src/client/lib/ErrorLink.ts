import locations from '@/shared/lib/locations';

interface ErrorLink {
  link: string;
  linkText: string;
}

enum linkText {
  DEFAULT = 'Report this error',
}

const DEFAULT_ERROR_LINK: ErrorLink = {
  link: locations.REPORT_ISSUE,
  linkText: linkText.DEFAULT,
};

export { ErrorLink, DEFAULT_ERROR_LINK };
