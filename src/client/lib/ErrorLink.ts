import locations from '@/client/lib/locations';
import { ChangePasswordErrors } from '@/shared/model/Errors';

interface ErrorLink {
  link: string;
  linkText: string;
}

enum linkText {
  DEFAULT = 'Report this error',
  PASSWORD = 'Password FAQs',
}

const DEFAULT_ERROR_LINK: ErrorLink = {
  link: locations.REPORT_ISSUE,
  linkText: linkText.DEFAULT,
};

const CUSTOM_ERROR_LINKS = new Map<string, ErrorLink>([
  [
    ChangePasswordErrors.PASSWORD_NO_MATCH,
    { link: locations.HELP, linkText: linkText.PASSWORD },
  ],
]);

const getErrorLink = (error: string): ErrorLink => {
  return CUSTOM_ERROR_LINKS.get(error) || DEFAULT_ERROR_LINK;
};

export { ErrorLink, getErrorLink };
