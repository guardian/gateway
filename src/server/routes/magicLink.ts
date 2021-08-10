import { Router, Request } from 'express';
import deepmerge from 'deepmerge';
import { Routes } from '@/shared/model/Routes';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderHelper';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { ResponseWithRequestState } from '@/server/models/Express';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { ViteDevServer } from 'vite';

const router = Router();

router.get(
  Routes.MAGIC_LINK,
  async (req: Request, res: ResponseWithRequestState) => {
    const vite: ViteDevServer = req.app.get('vite');
    const html = await renderer(vite, Routes.MAGIC_LINK, {
      requestState: res.locals,
      pageTitle: PageTitle.MAGIC_LINK,
    });
    res.type('html').send(html);
  },
);

router.post(
  Routes.MAGIC_LINK,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;
    const vite: ViteDevServer = req.app.get('vite');
    const { email = '' } = req.body;

    try {
      console.log(
        `TODO: Implement the logic to send the magic link to ${email} here`,
      );
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status } = error;

      trackMetric(Metrics.SEND_MAGIC_LINK_FAILURE);

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });

      const html = await renderer(vite, Routes.MAGIC_LINK, {
        requestState: state,
        pageTitle: PageTitle.MAGIC_LINK,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.SEND_MAGIC_LINK_SUCCESS);

    return res.redirect(303, Routes.MAGIC_LINK_SENT);
  }),
);

router.get(
  Routes.MAGIC_LINK_SENT,
  async (_: Request, res: ResponseWithRequestState) => {
    const vite: ViteDevServer = res.app.get('vite');
    const html = await renderer(vite, Routes.MAGIC_LINK_SENT, {
      pageTitle: PageTitle.MAGIC_LINK,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

export default router;
