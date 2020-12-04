import { Router, Request, Response } from 'express';
import { Routes } from '@/shared/model/Routes';
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
import { PageData } from '@/shared/model/ClientState';
import { NewsLetter, NewsletterPatch } from '@/shared/model/Newsletter';
import {
  Consent,
  CONSENTS_COMMUNICATION_PAGE,
  CONSENTS_DATA_PAGE,
} from '@/shared/model/Consent';
import { loginMiddleware } from '@/server/lib/middleware/login';
import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { VERIFY_EMAIL } from '@/shared/model/Success';
import { trackMetric } from '@/server/lib/AWS';
import { consentsPageMetric } from '@/server/models/Metrics';
import { addReturnUrlToPath } from '@/server/lib/queryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import { NewsletterMap } from '@/shared/lib/newsletter';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';

const router = Router();

interface ConsentPage {
  page: string;
  read: (ip: string, sc_gu_u: string, geo?: GeoLocation) => Promise<PageData>;
  pageTitle: string;
  update?: (
    ip: string,
    sc_gu_u: string,
    body: { [key: string]: string },
    geo?: GeoLocation,
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

export const consentPages: ConsentPage[] = [
  {
    page: Routes.CONSENTS_COMMUNICATION.slice(1),
    pageTitle: CONSENTS_PAGES.CONTACT,
    read: async (ip, sc_gu_u) => {
      try {
        return {
          consents: await getUserConsentsForPage(
            CONSENTS_COMMUNICATION_PAGE,
            ip,
            sc_gu_u,
          ),
          page: Routes.CONSENTS_COMMUNICATION.slice(1),
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
    pageTitle: CONSENTS_PAGES.NEWSLETTERS,
    read: async (ip, sc_gu_u, geo) => {
      try {
        return {
          page: Routes.CONSENTS_NEWSLETTERS.slice(1),
          newsletters: await getUserNewsletterSubscriptions(
            NewsletterMap.get(geo) as string[],
            ip,
            sc_gu_u,
          ),
          previousPage: Routes.CONSENTS_COMMUNICATION.slice(1),
        };
      } catch (error) {
        throw error;
      }
    },
    update: async (ip, sc_gu_u, body, geo) => {
      const newslettersPage = NewsletterMap.get(geo) as string[];

      const userNewsletterSubscriptions = await getUserNewsletterSubscriptions(
        newslettersPage,
        ip,
        sc_gu_u,
      );

      const newslettersSubscriptionFromPage: NewsletterPatch[] = newslettersPage.map(
        (id) => ({
          id,
          subscribed: !!body[id],
        }),
      );

      const newsletterSubscriptionsToUpdate = newslettersSubscriptionFromPage.filter(
        ({ id, subscribed }) => {
          // find current user subscription status for a newsletter
          const subscription = userNewsletterSubscriptions.find(
            ({ id: userNewsletterId }) => userNewsletterId === id,
          );

          // check if a subscription exists
          if (subscription) {
            // if previously subscribed AND now wants to unsubscribe
            // OR if previously not subscribed AND wants to subscribe
            // then include in newsletterSubscriptionsToUpdate
            if (
              (subscription.subscribed && !subscribed) ||
              (!subscription.subscribed && subscribed)
            ) {
              return true;
            }
          }

          // otherwise don't include in the update
          return false;
        },
      );

      await patchNewsletters(ip, sc_gu_u, newsletterSubscriptionsToUpdate);
    },
  },
  {
    page: Routes.CONSENTS_DATA.slice(1),
    pageTitle: CONSENTS_PAGES.YOUR_DATA,
    read: async (ip, sc_gu_u) => {
      try {
        return {
          consents: await getUserConsentsForPage(
            CONSENTS_DATA_PAGE,
            ip,
            sc_gu_u,
          ),
          page: Routes.CONSENTS_DATA.slice(1),
          previousPage: Routes.CONSENTS_NEWSLETTERS.slice(1),
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
    page: Routes.CONSENTS_REVIEW.slice(1),
    pageTitle: CONSENTS_PAGES.REVIEW,
    read: async (ip, sc_gu_u, geo) => {
      const ALL_CONSENT = [
        ...CONSENTS_DATA_PAGE,
        ...CONSENTS_COMMUNICATION_PAGE,
      ];

      return {
        page: Routes.CONSENTS_REVIEW.slice(1),
        consents: await getUserConsentsForPage(ALL_CONSENT, ip, sc_gu_u),
        newsletters: await getUserNewsletterSubscriptions(
          NewsletterMap.get(geo) as string[],
          ip,
          sc_gu_u,
        ),
      };
    },
  },
];

router.get(Routes.CONSENTS, loginMiddleware, (_: Request, res: Response) => {
  let url = `${Routes.CONSENTS}/${consentPages[0].page}`;
  if (res.locals?.queryParams?.returnUrl) {
    url = addReturnUrlToPath(url, res.locals.queryParams.returnUrl);
  }
  res.redirect(303, url);
});

router.get(
  `${Routes.CONSENTS}/:page`,
  loginMiddleware,
  async (req: Request, res: ResponseWithServerStateLocals) => {
    const sc_gu_u = req.cookies.SC_GU_U;

    const { emailVerified } = res.locals.queryParams;

    if (emailVerified) {
      res.locals.globalMessage.success = VERIFY_EMAIL.SUCCESS;
    }

    const { page } = req.params;
    let status = 200;

    const pageIndex = consentPages.findIndex((elem) => elem.page === page);
    if (pageIndex === -1) {
      return res.redirect(404, `${Routes.CONSENTS}/${page}`);
    }

    let pageTitle = 'Onboarding';

    try {
      const { read, pageTitle: _pageTitle } = consentPages[pageIndex];
      pageTitle = _pageTitle;

      res.locals.pageData = await read(
        req.ip,
        sc_gu_u,
        res.locals.pageData.geolocation,
      );
      res.locals.pageData.returnUrl = res.locals?.queryParams?.returnUrl;
    } catch (e) {
      status = e.status;
      res.locals.globalMessage.error = e.message;
    }

    const html = renderer(`${Routes.CONSENTS}/${page}`, {
      serverState: res.locals,
      pageTitle,
    });

    trackMetric(consentsPageMetric(page, 'Get', status === 200));

    res
      .type('html')
      .status(status ?? 500)
      .send(html);
  },
);

router.post(
  `${Routes.CONSENTS}/:page`,
  loginMiddleware,
  async (req: Request, res: ResponseWithServerStateLocals) => {
    const sc_gu_u = req.cookies.SC_GU_U;

    const { page } = req.params;
    let status = 200;

    const pageIndex = consentPages.findIndex((elem) => elem.page === page);
    if (pageIndex === -1) {
      return res.redirect(404, `${Routes.CONSENTS}/${page}`);
    }

    let pageTitle = 'Onboarding';

    try {
      const { update, pageTitle: _pageTitle } = consentPages[pageIndex];
      pageTitle = _pageTitle;

      if (update) {
        await update(
          req.ip,
          sc_gu_u,
          req.body,
          res.locals.pageData.geolocation,
        );
      }

      trackMetric(consentsPageMetric(page, 'Post', true));

      let url = `${Routes.CONSENTS}/${consentPages[pageIndex + 1].page}`;
      if (res.locals?.queryParams?.returnUrl) {
        url = addReturnUrlToPath(url, res.locals.queryParams.returnUrl);
      }
      return res.redirect(303, url);
    } catch (e) {
      status = e.status;
      res.locals.globalMessage.error = e.message;
    }

    trackMetric(consentsPageMetric(page, 'Post', false));

    const html = renderer(`${Routes.CONSENTS}/${page}`, {
      pageTitle,
      serverState: res.locals,
    });
    res
      .type('html')
      .status(status ?? 500)
      .send(html);
  },
);

export default router;
