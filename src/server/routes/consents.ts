import { Router, Request, Response } from 'express';
import { Routes } from '@/shared/model/Routes';
import { verifyEmail } from '@/server/lib/idapi/verifyEmail';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { read as getNewsletters } from '@/server/lib/idapi/newsletters';
import { GlobalState } from '@/shared/model/GlobalState';
import { Newsletters } from '@/shared/model/Newsletter';

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
    res.redirect(301, Routes.CONSENTS);
  },
);

router.get(Routes.CONSENTS, (req: Request, res: Response) => {
  const html = renderer(Routes.CONSENTS);
  res.type('html').send(html);
});

router.get(Routes.CONSENTS_NEWSLETTERS, async (req: Request, res: Response) => {
  const NEWSLETTER_FILTER = [
    Newsletters.BOOKMARKS,
    Newsletters.GREENLIGHT,
    Newsletters.LABNOTES,
    Newsletters.THELONGREAD,
  ];

  const state: GlobalState = {};
  try {
    const newsletters = await getNewsletters();
    state.pageData = {
      newsletters: newsletters.filter((n) => NEWSLETTER_FILTER.includes(+n.id)),
    };
  } catch (e) {
    const { message } = e;
    logger.error(e);
    state.error = message;
  }
  const html = renderer(Routes.CONSENTS_NEWSLETTERS, {
    globalState: state,
  });
  res.type('html').send(html);
});

export default router;
