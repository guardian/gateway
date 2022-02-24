import '@testing-library/cypress/add-commands';

import { mockNext } from './commands/mockNext';
import { mockAll } from './commands/mockAll';
import { mockPurge } from './commands/mockPurge';
import { setMvtId } from './commands/setMvtId';
import { setEncryptedStateCookie } from './commands/setEncryptedStateCookie';
import { network } from './commands/network';
import { mockPattern } from './commands/mockPattern';
import { lastPayloadIs } from './commands/lastPayloadIs';
import { checkForEmailAndGetDetails } from './commands/getEmailDetails';
import { createTestUser } from './commands/testUser';

Cypress.Commands.add('mockNext', mockNext);
Cypress.Commands.add('mockPattern', mockPattern); // unused, candidate for removal
Cypress.Commands.add('network', network);
Cypress.Commands.add('mockPurge', mockPurge);
Cypress.Commands.add('mockAll', mockAll);
Cypress.Commands.add('setMvtId', setMvtId);
Cypress.Commands.add('setEncryptedStateCookie', setEncryptedStateCookie);
Cypress.Commands.add('lastPayloadIs', lastPayloadIs);
Cypress.Commands.add('checkForEmailAndGetDetails', checkForEmailAndGetDetails);
Cypress.Commands.add('createTestUser', createTestUser);
