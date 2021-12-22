import { Router } from 'express';

import { default as core } from './core';
import { default as signIn } from './signIn';
import { default as register } from './register';
import { default as resetPassword } from './resetPassword';
import { default as consents } from './consents';
import { default as verifyEmail } from './verifyEmail';
import { default as magicLink } from './magicLink';
import { default as welcome } from './welcome';
import { default as setPassword } from './setPassword';
import { noCache } from '@/server/lib/middleware/cache';

const router = Router();
const uncachedRoutes = Router();

// core routes for the app, e.g. healthcheck, static routes
router.use(core);

// all routes should be uncached except for the core (static) routes
// to avoid caching sensitive page state
uncachedRoutes.use(noCache);

// request sign in routes
uncachedRoutes.use(signIn);

// request registration routes
uncachedRoutes.use(register);

// reset password routes
uncachedRoutes.use(resetPassword);

// set password routes
uncachedRoutes.use(setPassword);

// consents routes
uncachedRoutes.use(consents);

// verify email routes
uncachedRoutes.use(verifyEmail);

// magic link routes
uncachedRoutes.use(magicLink);

// welcome routes
uncachedRoutes.use(noCache, welcome);

router.use(uncachedRoutes);

export default router;
