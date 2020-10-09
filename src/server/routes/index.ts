import { Router } from 'express';

import { default as core } from './core';
import { default as reset } from './reset';
import { default as changePassword } from './changePassword';
import { default as consents } from './consents';
import { default as verifyEmail } from './verifyEmail';
import { queryParamsMiddleware } from '@/server/lib/middleware/queryParams';
import { noCache } from '@/server/lib/middleware/cache';

const router = Router();

// core routes for the app, e.g. healthcheck, static routes
router.use(core);

// request reset password routes
router.use(noCache, queryParamsMiddleware, reset);

// change password routes
router.use(noCache, queryParamsMiddleware, changePassword);

// consents routes
router.use(noCache, queryParamsMiddleware, consents);

// verify email routes
router.use(noCache, queryParamsMiddleware, verifyEmail);

export default router;
