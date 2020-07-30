import { Router, Request, Response } from 'express';
import { Routes } from '@/shared/model/Routes';
import { verifyEmail } from '@/server/lib/idapi/verifyEmail';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { logger } from '@/server/lib/logger';

const router = Router();

router.get(
  `${Routes.VERIFY_EMAIL}${Routes.VERIFY_EMAIL_TOKEN}`,
  async (req: Request, res: Response) => {
    const { token } = req.params;
    try {
      const cookies = await verifyEmail(token, req.ip);

      setIDAPICookies(res, cookies);
    } catch (e) {
      logger.error(e);
    }
    res.send('OK');
  },
);

export default router;
