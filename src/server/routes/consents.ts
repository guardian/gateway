import { Router, Request, Response } from 'express';
import { Routes } from '@/shared/model/Routes';
import { verifyEmail } from '@/server/lib/idapi/verifyEmail';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import {
  update as patchConsents,
  read as readConsents,
} from '@/server/lib/idapi/consents';
import {
  update as patchNewsletters,
  readUserNewsletters,
} from '@/server/lib/idapi/newsletters';
import { read as getNewsletters } from '@/server/lib/idapi/newsletters';
import { read as getUser } from '@/server/lib/idapi/user';
import { GlobalState, PageData } from '@/shared/model/GlobalState';
import {
  NewsLetter,
  NewsletterPatch,
  NEWSLETTERS_PAGE,
} from '@/shared/model/Newsletter';
import {
  Consent,
  CONSENTS_COMMUNICATION_PAGE,
  CONSENTS_DATA_PAGE,
} from '@/shared/model/Consent';

const router = Router();

interface ConsentPage {
  page: string;
  read: (ip: string, sc_gu_u: string) => Promise<PageData>;
  update?: (
    ip: string,
    sc_gu_u: string,
    body: { [key: string]: string },
  ) => Promise<void>;
}

const getConsentValueFromRequestBody = (
  key: string,
  body: { [key: string]: string },
): boolean => {
  if (body[key] === undefined || typeof body[key] !== 'string') {
    return false;
  }

  switch (body[key]) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return !!body[key];
  }
};

const getUserConsentsForPage = async (
  pageConsents: string[],
  ip: string,
  sc_gu_u: string,
): Promise<Consent[]> => {
  const allConsents = await readConsents();
  const userConsents = (await getUser(ip, sc_gu_u)).consents;

  return pageConsents
    .map((id) => allConsents.find((consent) => consent.id === id))
    .map((consent) => {
      if (consent) {
        const userConsent = userConsents.find((uc) => uc.id === consent.id);

        if (userConsent) {
          consent.consented = userConsent.consented;
        }

        return consent;
      }
    })
    .filter(Boolean) as Consent[];
};

const getUserNewsletterSubscriptions = async (
  newslettersOnPage: string[],
  ip: string,
  sc_gu_u: string,
): Promise<NewsLetter[]> => {
  const allNewsletters = await getNewsletters();
  const userNewsletterSubscriptions = await readUserNewsletters(ip, sc_gu_u);

  return newslettersOnPage
    .map((id) => allNewsletters.find((newsletter) => newsletter.id === id))
    .map((newsletter) => {
      if (newsletter) {
        if (userNewsletterSubscriptions.includes(newsletter.id)) {
          newsletter.subscribed = true;
        }
        return newsletter;
      }
    })
    .filter(Boolean) as NewsLetter[];
};

const consentPages: ConsentPage[] = [
  {
    page: Routes.CONSENTS_DATA.slice(1),
    read: async (ip, sc_gu_u) => {
      try {
        return {
          consents: await getUserConsentsForPage(
            CONSENTS_DATA_PAGE,
            ip,
            sc_gu_u,
          ),
          page: Routes.CONSENTS_DATA.slice(1),
        };
      } catch (error) {
        throw error;
      }
    },
    update: async (ip, sc_gu_u, body) => {
      const consents = CONSENTS_DATA_PAGE.map((id) => ({
        id,
        consented: getConsentValueFromRequestBody(id, body),
      }));

      await patchConsents(ip, sc_gu_u, consents);
    },
  },
  {
    page: Routes.CONSENTS_COMMUNICATION.slice(1),
    read: async (ip, sc_gu_u) => {
      try {
        return {
          consents: await getUserConsentsForPage(
            CONSENTS_COMMUNICATION_PAGE,
            ip,
            sc_gu_u,
          ),
          page: Routes.CONSENTS_COMMUNICATION.slice(1),
          previousPage: Routes.CONSENTS_DATA.slice(1),
        };
      } catch (error) {
        throw error;
      }
    },
    update: async (ip, sc_gu_u, body) => {
      const consents = CONSENTS_COMMUNICATION_PAGE.map((id) => ({
        id,
        consented: getConsentValueFromRequestBody(id, body),
      }));

      await patchConsents(ip, sc_gu_u, consents);
    },
  },
  {
    page: Routes.CONSENTS_NEWSLETTERS.slice(1),
    read: async (ip, sc_gu_u) => {
      try {
        return {
          page: Routes.CONSENTS_NEWSLETTERS.slice(1),
          previousPage: Routes.CONSENTS_COMMUNICATION.slice(1),
          newsletters: await getUserNewsletterSubscriptions(
            NEWSLETTERS_PAGE,
            ip,
            sc_gu_u,
          ),
        };
      } catch (error) {
        throw error;
      }
    },
    update: async (ip, sc_gu_u, body) => {
      const newsletters: NewsletterPatch[] = NEWSLETTERS_PAGE.map((id) => ({
        id,
        subscribed: !!body[id],
      }));

      await patchNewsletters(ip, sc_gu_u, newsletters);
    },
  },
  {
    page: Routes.CONSENTS_REVIEW.slice(1),
    read: async (ip, sc_gu_u) => {
      const ALL_CONSENT = [
        ...CONSENTS_DATA_PAGE,
        ...CONSENTS_COMMUNICATION_PAGE,
      ];

      return {
        page: Routes.CONSENTS_REVIEW.slice(1),
        consents: await getUserConsentsForPage(ALL_CONSENT, ip, sc_gu_u),
        newsletters: await getUserNewsletterSubscriptions(
          NEWSLETTERS_PAGE,
          ip,
          sc_gu_u,
        ),
      };
    },
  },
];

router.get(
  `${Routes.VERIFY_EMAIL}${Routes.VERIFY_EMAIL_TOKEN}`,
  async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      const cookies = await verifyEmail(token, req.ip);
      setIDAPICookies(res, cookies);
    } catch (error) {
      const { message, status } = error;
      logger.error(error);

      const state: GlobalState = {
        error: message,
      };

      const html = renderer(Routes.VERIFY_EMAIL, {
        globalState: state,
      });

      return res.status(status).type('html').send(html);
    }

    return res.redirect(303, `${Routes.CONSENTS}/${consentPages[0].page}`);
  },
);

router.get(Routes.CONSENTS, (_: Request, res: Response) => {
  res.redirect(303, `${Routes.CONSENTS}/${consentPages[0].page}`);
});

router.get(`${Routes.CONSENTS}/:page`, async (req: Request, res: Response) => {
  const sc_gu_u = req.cookies.SC_GU_U;
  const state: GlobalState = {};

  const { page } = req.params;
  let status = 200;

  const pageIndex = consentPages.findIndex((elem) => elem.page === page);
  if (pageIndex === -1) {
    return res.redirect(404, `${Routes.CONSENTS}/${page}`);
  }

  try {
    const { read } = consentPages[pageIndex];

    state.pageData = await read(req.ip, sc_gu_u);
  } catch (e) {
    status = e.status;
    state.error = e.message;
  }

  const html = renderer(`${Routes.CONSENTS}/${page}`, { globalState: state });

  res
    .type('html')
    .status(status ?? 500)
    .send(html);
});

router.post(`${Routes.CONSENTS}/:page`, async (req, res) => {
  const sc_gu_u = req.cookies.SC_GU_U;
  const state: GlobalState = {};

  const { page } = req.params;
  let status = 200;

  const pageIndex = consentPages.findIndex((elem) => elem.page === page);
  if (pageIndex === -1) {
    return res.redirect(404, `${Routes.CONSENTS}/${page}`);
  }

  try {
    const { update } = consentPages[pageIndex];

    if (update) {
      await update(req.ip, sc_gu_u, req.body);
    }

    return res.redirect(
      303,
      `${Routes.CONSENTS}/${consentPages[pageIndex + 1].page}`,
    );
  } catch (e) {
    status = e.status;
    state.error = e.message;
  }

  const html = renderer(`${Routes.CONSENTS}/${page}`, { globalState: state });
  res
    .type('html')
    .status(status ?? 500)
    .send(html);
});

export default router;
