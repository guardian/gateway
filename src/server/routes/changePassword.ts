import { Request, Router } from 'express';
import { Routes } from '@/shared/model/Routes';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { PageTitle } from '@/shared/model/PageTitle';
import {
  checkResetPasswordTokenController,
  setPasswordTokenController,
} from '@/server/controllers/changePassword';

const router = Router();

router.get(
  `${Routes.CHANGE_PASSWORD}${Routes.TOKEN_PARAM}`,
  checkResetPasswordTokenController(
    Routes.CHANGE_PASSWORD,
    PageTitle.CHANGE_PASSWORD,
    Routes.RESET,
    PageTitle.RESET_RESEND,
  ),
);

router.post(
  `${Routes.CHANGE_PASSWORD}${Routes.TOKEN_PARAM}`,
  setPasswordTokenController(
    Routes.CHANGE_PASSWORD,
    PageTitle.CHANGE_PASSWORD,
    Routes.RESET,
    PageTitle.RESET_RESEND,
    (res) => {
      const html = renderer(Routes.CHANGE_PASSWORD_COMPLETE, {
        requestState: res.locals,
        pageTitle: PageTitle.CHANGE_PASSWORD_COMPLETE,
      });

      return res.type('html').send(html);
    },
  ),
);

router.get(
  Routes.CHANGE_PASSWORD_COMPLETE,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(Routes.CHANGE_PASSWORD_COMPLETE, {
      requestState: res.locals,
      pageTitle: PageTitle.CHANGE_PASSWORD_COMPLETE,
    });
    return res.type('html').send(html);
  },
);

router.get(
  `${Routes.RESET}${Routes.RESEND}`,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(`${Routes.RESET}${Routes.RESEND}`, {
      pageTitle: PageTitle.RESET_RESEND,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

router.get(
  `${Routes.RESET}${Routes.EXPIRED}`,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(`${Routes.RESET}${Routes.EXPIRED}`, {
      pageTitle: PageTitle.RESET_RESEND,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

export default router;
