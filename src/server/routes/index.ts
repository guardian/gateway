import { Router } from 'express';

import { default as core } from './core';
import { default as reset } from './reset';
import { default as resetPassword } from './changePassword';

const router = Router();

router.use(core);
router.use(reset);
router.use(resetPassword);

export default router;
