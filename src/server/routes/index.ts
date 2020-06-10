import { Router } from 'express';

import { default as core } from './core';
import { default as reset } from './reset';
import { default as resetPassword } from './changePassword';
import { queryParamsMiddleware } from '@/server/lib/middleware/queryParams';

const router = Router();

router.use(core);
router.use(queryParamsMiddleware, reset);
router.use(queryParamsMiddleware, resetPassword);

export default router;
