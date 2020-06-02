import { Request, Response, Router } from 'express';
import { Routes } from '@/shared/model/Routes';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/logger';
import { GlobalState } from '@/shared/model/GlobalState';
import { get as verifyToken } from '../lib/idapi/changePassword';

const router = Router();

router.get(
  `${Routes.CHANGE_PASSWORD}${Routes.CHANGE_PASSWORD_TOKEN}`,
  async (req: Request, res: Response) => {
    const { token } = req.params;
    // const state: GlobalState = {};

    try {
      const response = await verifyToken(token, req.ip);
      console.log(response);
    } catch (error) {
      logger.error(error);
      // state.error = error;
      // res.sendStatus(403);
      // return;
    }

    const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`);
    return res.type('html').send(html);
  },
);

router.get(Routes.CHANGE_PASSWORD_SENT, (req: Request, res: Response) => {
  const html = renderer(Routes.CHANGE_PASSWORD_SENT);
  return res.type('html').send(html);
});

export default router;
