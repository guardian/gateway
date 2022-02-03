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

const getErrorLink = (): ErrorLink => {
  return DEFAULT_ERROR_LINK;
};

export { ErrorLink, getErrorLink };
