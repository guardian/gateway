import '@testing-library/cypress/add-commands';

import { mockNext } from './commands/mockNext';
import { mockAll } from './commands/mockAll';
import { mockPurge } from './commands/mockPurge';
import { setMvtId } from './commands/setMvtId';
import { setAdFreeCookie } from './commands/setAdFreeCookie';
import { setEncryptedStateCookie } from './commands/setEncryptedStateCookie';
import { network } from './commands/network';
import { mockPattern } from './commands/mockPattern';
import { lastPayloadIs } from './commands/lastPayloadIs';
import { lastPayloadsAre } from './commands/lastPayloadsAre';
import { checkForEmailAndGetDetails } from './commands/getEmailDetails';
import {
	getTestOktaUser,
	activateTestOktaUser,
	createTestUser,
	resetOktaUserPassword,
	expireOktaUserPassword,
	suspendOktaUser,
	addOktaUserToGroup,
	findEmailValidatedOktaGroupId,
	getOktaUserGroups,
	getTestUserDetails,
	updateTestUser,
	updateOktaTestUserProfile,
	getCurrentOktaSession,
	closeCurrentOktaSession,
	sendConsentEmail,
} from './commands/testUser';
import { interceptRecaptcha } from './commands/recaptcha';
import { oktaGetApps } from './commands/oktaManagementApi';

Cypress.Commands.add('mockNext', mockNext);
Cypress.Commands.add('mockPattern', mockPattern); // unused, candidate for removal
Cypress.Commands.add('network', network);
Cypress.Commands.add('mockPurge', mockPurge);
Cypress.Commands.add('mockAll', mockAll);
Cypress.Commands.add('setMvtId', setMvtId);
Cypress.Commands.add('setAdFreeCookie', setAdFreeCookie);
Cypress.Commands.add('setEncryptedStateCookie', setEncryptedStateCookie);
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
