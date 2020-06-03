import { Request, Response, Router } from 'express';
import { Routes } from '@/shared/model/Routes';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/logger';
import { GlobalState } from '@/shared/model/GlobalState';
import {
  validate as validateToken,
  change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { ResetPasswordErrors } from '@/shared/model/Errors';

const router = Router();

router.get(
  `${Routes.CHANGE_PASSWORD}${Routes.CHANGE_PASSWORD_TOKEN}`,
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const state: GlobalState = {};

    try {
      const email = await validateToken(token, req.ip);

      state.email = email;
    } catch (error) {
      logger.error(error);
      state.error = error;
      res.sendStatus(403);
      return;
    }

    const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, state);
    return res.type('html').send(html);
  },
);

router.post(
  `${Routes.CHANGE_PASSWORD}${Routes.CHANGE_PASSWORD_TOKEN}`,
  async (req: Request, res: Response) => {
    const state: GlobalState = {};

    const { token } = req.params;

    const { password, password_confirm: passwordConfirm } = req.body;

    try {
      if (!password || !passwordConfirm || password !== passwordConfirm) {
        throw ResetPasswordErrors.GENERIC;
      }

      await changePassword(password, token, req.ip);
    } catch (error) {
      logger.error(error);
      state.error = error;
      res.sendStatus(403);
      return;
    }

    return res.redirect(301, Routes.CHANGE_PASSWORD_SENT);
  },
);

router.get(Routes.CHANGE_PASSWORD_SENT, (req: Request, res: Response) => {
  const html = renderer(Routes.CHANGE_PASSWORD_SENT);
  return res.type('html').send(html);
});

export default router;
