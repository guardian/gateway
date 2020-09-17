import { Router, Request, Response } from 'express';
import { Routes } from '@/shared/model/Routes';
import { verifyEmail } from '@/server/lib/idapi/verifyEmail';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { update as patchConsents } from '@/server/lib/idapi/consents';
import { read as getNewsletters } from '@/server/lib/idapi/newsletters';
import { read as getUser } from '@/server/lib/idapi/user';
import { GlobalState } from '@/shared/model/GlobalState';
import { Newsletters } from '@/shared/model/Newsletter';
import { Consent, Consents, ConsentsData } from '@/shared/model/Consent';

const router = Router();

const consentsFlow = [
  Routes.CONSENTS_DATA,
  Routes.CONSENTS_COMMUNICATION,
  Routes.CONSENTS_NEWSLETTERS,
  Routes.CONSENTS_REVIEW,
].map((s) => s.slice(1));

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

    res.redirect(303, `${Routes.CONSENTS}/${consentsFlow[0]}`);
  },
);

const consentsForPage = async (
  page: string,
  ip: string,
  sc_gu_u: string,
): Promise<Consent[]> => {
  switch (page) {
    case consentsFlow[0]:
      return (await getUser(ip, sc_gu_u)).consents.filter(
        (c) => c.id === Consents.PROFILING,
      );
    default:
      return [];
  }
};

const mergeConsents = (
  page: string,
  consents: Consent[],
  body: { [key: string]: string },
): Consent[] => {
  switch (page) {
    case consentsFlow[0]:
      return consents.map((consent) => {
        const { id } = consent;

        if (ConsentsData.includes(id) && body[id]) {
          consent.consented = body[id] === 'true';
        }

        return consent;
      });
    default:
      return consents;
  }
};

const consentsController = async (req: Request, res: Response) => {
  const sc_gu_u = req.cookies.SC_GU_U;
  const state: GlobalState = {};

  const { page = consentsFlow[0] } = req.params;

  try {
    const currentPageIndex = consentsFlow.indexOf(page);
    if (currentPageIndex === -1) {
      throw new Error(`Invalid Consents Page: ${page}`);
    }
    const previousPage = consentsFlow[currentPageIndex - 1] ?? null;

    const consents = await consentsForPage(page, req.ip, sc_gu_u);

    state.pageData = {
      consents,
      page,
      previousPage,
    };
  } catch (e) {
    state.error = e;
  }

  const html = renderer(`${Routes.CONSENTS}/${page}`, { globalState: state });

  res.type('html').send(html);
};

router.get(Routes.CONSENTS, consentsController);

router.get(`${Routes.CONSENTS}/:page`, consentsController);

router.post('/consents', async (req, res) => {
  const sc_gu_u = req.cookies.SC_GU_U;
  const state: GlobalState = {};

  const { page = consentsFlow[0] } = req.body;

  try {
    const currentPageIndex = consentsFlow.indexOf(page);

    if (currentPageIndex === -1) {
      throw new Error(`Invalid Consents Page: ${page}`);
    }

    const consents = await consentsForPage(page, req.ip, sc_gu_u);
    const mergedConsents = mergeConsents(page, consents, req.body);

    await patchConsents(req.ip, sc_gu_u, mergedConsents);

    // get next page to render
    const nextPage = consentsFlow[currentPageIndex + 1] ?? null;

    return res.redirect(303, `${Routes.CONSENTS}/${nextPage}`);
  } catch (e) {
    console.log(e);
    state.error = e;
  }

  const html = renderer(`${Routes.CONSENTS}/${page}`, { globalState: state });
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
