import { Consent } from '@/shared/model/Consent';
import { UserConsent } from '@/shared/model/User';

/**
 * See PR https://github.com/guardian/identity/pull/2079 for more details.
 *
 * Necessary due to business requirements changing the wording of opt out (legitimate interest)
 * consents into opt ins for user UI/UX, but maintaining the consent model as an opt out (including IDs "eg. Profiling_Optout")
 * due to downstream business integrations
 *
 * Intended for use in /src/server/lib/idapi/consents.ts  when user page consents are retrieved from the server
 * and when user consent updates are posted back to the server.
 */

type ConversionString = '_optout' | '_optin';

const invertConsents = <ConsentType extends UserConsent | Consent>(
  input: ConversionString,
  output: ConversionString,
) => {
  return (pageConsents: ConsentType[]) => {
    return pageConsents.map((consent) => {
      if (!consent.id.includes(input)) {
        return consent;
      }

      return {
        id: consent.id.replace(input, output),
        ...('name' in consent && { name: consent.name }),
        ...('description' in consent && { description: consent.description }),
        ...('consented' in consent && { consented: !consent.consented }),
      };
    });
  };
};

export const invertOptOutConsents = invertConsents('_optout', '_optin');
export const invertOptInConsents = invertConsents('_optin', '_optout');
