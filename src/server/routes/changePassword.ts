import { Request } from 'express';
import deepmerge from 'deepmerge';
import { Routes } from '@/shared/model/Routes';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { PageTitle } from '@/shared/model/PageTitle';
import {
  checkResetPasswordTokenController,
  setPasswordTokenController,
} from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { typedRouter as router } from '@/server/lib/typedRoutes';

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
    (res) =>
      res.redirect(
        303,
        addQueryParamsToPath(
          `${Routes.PASSWORD}${Routes.RESET_CONFIRMATION}`,
          res.locals.queryParams,
        ),
      ),
  ),
);

router.get(
  `${Routes.PASSWORD}${Routes.RESET_CONFIRMATION}`,
  (req: Request, res: ResponseWithRequestState) => {
    const email = readEmailCookie(req);

    const html = renderer(`${Routes.PASSWORD}${Routes.RESET_CONFIRMATION}`, {
      requestState: deepmerge(res.locals, {
        pageData: {
          email,
        },
      }),
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

export default router.router;
