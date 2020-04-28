import { Router } from 'express';

import { default as core } from './core';
import { default as reset } from './reset';

const router = Router();

router.use(core);
router.use('/reset', reset);

export default router;
