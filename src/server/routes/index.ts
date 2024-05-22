import { Router } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { noCache } from '@/server/lib/middleware/cache';

import { default as core } from './core';
import { default as signIn } from './signIn';
import { default as signOut } from './signOut';
import { default as register } from './register';
import { default as resetPassword } from './resetPassword';
import { default as verifyEmail } from './verifyEmail';
import { default as welcome } from './welcome';
import { default as setPassword } from './setPassword';
import { default as maintenance } from './maintenance';
import { default as oauth } from './oauth';
import { default as emailTemplates } from './emailTemplates';
import { default as agree } from './agree';
import { default as changeEmail } from './changeEmail';
import { default as subscriptions } from './subscriptions';
import { default as consentToken } from './consentToken';
import { default as deleteAccount } from './delete';

const { okta } = getConfiguration();

const router = Router();
const uncachedRoutes = Router();

// core routes for the app, e.g. healthcheck, static routes
router.use(core);

// all routes should be uncached except for the core (static) routes
// to avoid caching sensitive page state
uncachedRoutes.use(noCache);

// maintenance page
uncachedRoutes.use(maintenance);

// request sign in routes
uncachedRoutes.use(signIn);

// request sign out routes
uncachedRoutes.use(signOut);

// request registration routes
uncachedRoutes.use(register);

// reset password routes
uncachedRoutes.use(resetPassword);

// set password routes
uncachedRoutes.use(setPassword);

// verify email routes
uncachedRoutes.use(verifyEmail);

// welcome routes
uncachedRoutes.use(welcome);

// terms and conditions routes
uncachedRoutes.use(agree);

// change email routes
uncachedRoutes.use(changeEmail);

// unsubscribe routes
uncachedRoutes.use(subscriptions);

// oauth callback routes
if (okta.enabled) {
	uncachedRoutes.use(oauth);
}

// consent token routes
uncachedRoutes.use(consentToken);

// delete account routes
uncachedRoutes.use(deleteAccount);

// email template routes
router.use(emailTemplates);

router.use(uncachedRoutes);

export default router;
