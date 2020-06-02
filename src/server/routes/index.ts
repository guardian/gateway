import { Router } from 'express';

import { default as core } from './core';
import { default as reset } from './reset';
import { default as resetPasword } from './change-password';

const router = Router();

router.use(core);
router.use(reset);
router.use(resetPasword);

export default router;
