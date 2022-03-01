import { Consent } from '@/shared/model/Consent';
import { UserConsent } from '@/shared/model/User';
import {
  invertOptOutConsents,
  invertOptInConsents,
} from '../../idapi/invertOptOutConsents';

describe('invertConsents', () => {
  const consentOptouts: Consent[] = [
    {
      id: 'A_optout',
      description: '', // optional IDAPI value eg. 'I do NOT want' in original OPT OUT modelling,
      name: 'Allow', // description/name values updated in IDAPI - see PR https://github.com/guardian/identity/pull/207
      consented: true,
    },
    {
      id: 'B_optout',
      description: '',
      name: 'Allow',
    },
    {
      id: 'C',
      description: '',
      name: 'Consent C name',
      consented: false,
    },
  ];

  const consentOptins: Consent[] = [
    {
      id: 'A_optin',
      description: '',
      name: 'Allow',
      consented: false,
    },
    {
      id: 'B_optin',
      description: '',
      name: 'Allow',
    },
    {
      id: 'C',
      description: '',
      name: 'Consent C name',
      consented: false,
    },
  ];
  test('invertOptOutConsents should correctly invert Consent type', () => {
    expect(invertOptOutConsents(consentOptouts)).toEqual(consentOptins);
  });
  test('invertOptInConsents should correctly invert Consent type', () => {
    expect(invertOptInConsents(consentOptins)).toEqual(consentOptouts);
  });

  const userConsentOptouts: UserConsent[] = [
    {
      id: 'A_optout',
      consented: true,
    },
    {
      id: 'B_optout',
      consented: false,
    },
    {
      id: 'C',
      consented: false,
    },
  ];

  const userConsentOptins: UserConsent[] = [
    {
      id: 'A_optin',
      consented: false,
    },
    {
      id: 'B_optin',
      consented: true,
    },
    {
      id: 'C',
      consented: false,
    },
  ];

  test('invertOptOutConsents should correctly invert UserConsent type', () => {
    expect(invertOptOutConsents(userConsentOptouts)).toEqual(userConsentOptins);
  });
  test('invertOptInConsents should correctly invert UserConsent type', () => {
    expect(invertOptInConsents(userConsentOptins)).toEqual(userConsentOptouts);
  });
});
