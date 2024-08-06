import '@testing-library/cypress/add-commands';

import { checkForEmailAndGetDetails } from './commands/getEmailDetails';
import { lastPayloadIs } from './commands/lastPayloadIs';
import { lastPayloadsAre } from './commands/lastPayloadsAre';
import {
	acceptCMP,
	declineCMP,
	disableCMP,
	enableCMP,
} from './commands/manageCmp';
import { mockAll } from './commands/mockAll';
import { mockNext } from './commands/mockNext';
import { mockPattern } from './commands/mockPattern';
import { mockPurge } from './commands/mockPurge';
import { network } from './commands/network';
import { oktaGetApps } from './commands/oktaManagementApi';
import { interceptRecaptcha } from './commands/recaptcha';
import { setAdFreeCookie } from './commands/setAdFreeCookie';
import { setEncryptedStateCookie } from './commands/setEncryptedStateCookie';
import { setMvtId } from './commands/setMvtId';
import {
	activateTestOktaUser,
	addOktaUserToGroup,
	closeCurrentOktaSession,
	createTestUser,
	expireOktaUserPassword,
	findEmailValidatedOktaGroupId,
	getCurrentOktaSession,
	getOktaUserGroups,
	getTestOktaUser,
	getTestUserDetails,
	resetOktaUserPassword,
	sendConsentEmail,
	suspendOktaUser,
	updateOktaTestUserProfile,
	updateTestUser,
} from './commands/testUser';

Cypress.Commands.add('mockNext', mockNext);
Cypress.Commands.add('mockPattern', mockPattern); // unused, candidate for removal
Cypress.Commands.add('network', network);
Cypress.Commands.add('mockPurge', mockPurge);
Cypress.Commands.add('mockAll', mockAll);
Cypress.Commands.add('setMvtId', setMvtId);
Cypress.Commands.add('setAdFreeCookie', setAdFreeCookie);
Cypress.Commands.add('setEncryptedStateCookie', setEncryptedStateCookie);
Cypress.Commands.add('disableCMP', disableCMP);
Cypress.Commands.add('enableCMP', enableCMP);
Cypress.Commands.add('acceptCMP', acceptCMP);
Cypress.Commands.add('declineCMP', declineCMP);
Cypress.Commands.add('lastPayloadIs', lastPayloadIs);
Cypress.Commands.add('lastPayloadsAre', lastPayloadsAre);
Cypress.Commands.add('checkForEmailAndGetDetails', checkForEmailAndGetDetails);
Cypress.Commands.add('createTestUser', createTestUser);
Cypress.Commands.add('getTestOktaUser', getTestOktaUser);
Cypress.Commands.add('activateTestOktaUser', activateTestOktaUser);
Cypress.Commands.add('resetOktaUserPassword', resetOktaUserPassword);
Cypress.Commands.add('expireOktaUserPassword', expireOktaUserPassword);
Cypress.Commands.add('suspendOktaUser', suspendOktaUser);
Cypress.Commands.add('addOktaUserToGroup', addOktaUserToGroup);
Cypress.Commands.add(
	'findEmailValidatedOktaGroupId',
	findEmailValidatedOktaGroupId,
);
Cypress.Commands.add('getOktaUserGroups', getOktaUserGroups);
Cypress.Commands.add('getTestUserDetails', getTestUserDetails);
Cypress.Commands.add('updateTestUser', updateTestUser);
Cypress.Commands.add('updateOktaTestUserProfile', updateOktaTestUserProfile);
Cypress.Commands.add('getCurrentOktaSession', getCurrentOktaSession);
Cypress.Commands.add('closeCurrentOktaSession', closeCurrentOktaSession);
Cypress.Commands.add('sendConsentEmail', sendConsentEmail);
Cypress.Commands.add('interceptRecaptcha', interceptRecaptcha);
Cypress.Commands.add('oktaGetApps', oktaGetApps);
