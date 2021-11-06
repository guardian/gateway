import { mockNext } from './commands/mockNext';
import { mockAll } from './commands/mockAll';
import { mockPurge } from './commands/mockPurge';
import { setMvtId } from './commands/setMvtId';
import { network } from './commands/network';
import { mockPattern } from './commands/mockPattern';
import { lastPayloadIs } from './commands/lastPayloadIs';
import {
  getEmailDetails,
  checkForEmailAndGetDetails,
} from './commands/getEmailDetails';
import { createTestUser } from './commands/testUser';

Cypress.Commands.add('mockNext', mockNext);
Cypress.Commands.add('mockPattern', mockPattern); // unused, candidate for removal
Cypress.Commands.add('network', network);
Cypress.Commands.add('mockPurge', mockPurge);
Cypress.Commands.add('mockAll', mockAll);
Cypress.Commands.add('setMvtId', setMvtId);
Cypress.Commands.add('lastPayloadIs', lastPayloadIs);
Cypress.Commands.add('getEmailDetails', getEmailDetails);
Cypress.Commands.add('checkForEmailAndGetDetails', checkForEmailAndGetDetails);
Cypress.Commands.add('createTestUser', createTestUser);
