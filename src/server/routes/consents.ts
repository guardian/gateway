import { Request, Response } from 'express';
import deepmerge from 'deepmerge';

import { renderer } from '@/server/lib/renderer';
import { RoutePaths } from '@/shared/lib/routeUtils';
import { typedRouter as router } from '@/server/lib/typedRoutes';
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
import { ALL_NEWSLETTER_IDS, NewsLetter } from '@/shared/model/Newsletter';
import {
  Consent,
  CONSENTS_COMMUNICATION_PAGE,
  CONSENTS_DATA_PAGE,
} from '@/shared/model/Consent';
import { loginMiddleware } from '@/server/lib/middleware/login';
import {
  RequestState,
  ResponseWithRequestState,
} from '@/server/models/Express';
import { VERIFY_EMAIL } from '@/shared/model/Success';
import { trackMetric } from '@/server/lib/trackMetric';
import { consentsPageMetric } from '@/server/models/Metrics';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import {
  NewsletterMap,
  newslettersSubscriptionsFromFormBody,
} from '@/shared/lib/newsletter';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { fourZeroFourRender } from '@/server/lib/middleware/404';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/logger';
import { ApiError } from '@/server/models/Error';

interface ConsentPage {
  page: string;
  path: RoutePaths;
  read: (ip: string, sc_gu_u: string, geo?: GeoLocation) => Promise<PageData>;
  pageTitle: string;
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
        let updated = consent;
        const userConsent = userConsents.find((uc) => uc.id === consent.id);

        if (userConsent) {
          updated = {
            ...updated,
            consented: userConsent.consented,
          };
        }

        return updated;
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
        let updated = newsletter;
        if (userNewsletterSubscriptions.includes(newsletter.id)) {
          updated = {
            ...updated,
            subscribed: true,
          };
        }
        return updated;
      }
    })
    .filter(Boolean) as NewsLetter[];
};

export const consentPages: ConsentPage[] = [
  {
    page: 'communication',
    path: '/consents/communication',
    pageTitle: CONSENTS_PAGES.CONTACT,
    read: async (ip, sc_gu_u) => ({
      consents: await getUserConsentsForPage(
        CONSENTS_COMMUNICATION_PAGE,
        ip,
        sc_gu_u,
      ),
      page: 'communication',
    }),
    update: async (ip, sc_gu_u, body) => {
      const consents = CONSENTS_COMMUNICATION_PAGE.map((id) => ({
        id,
        consented: getConsentValueFromRequestBody(id, body),
      }));

      await patchConsents(ip, sc_gu_u, consents);
    },
  },
  {
    page: '/newsletters'.slice(1),
    path: '/consents/newsletters',
    pageTitle: CONSENTS_PAGES.NEWSLETTERS,
    read: async (ip, sc_gu_u, geo) => ({
      page: '/newsletters'.slice(1),
      newsletters: await getUserNewsletterSubscriptions(
        NewsletterMap.get(geo) as string[],
        ip,
        sc_gu_u,
      ),
      previousPage: '/communication'.slice(1),
    }),
    update: async (ip, sc_gu_u, body) => {
      const userNewsletterSubscriptions = await getUserNewsletterSubscriptions(
        ALL_NEWSLETTER_IDS,
        ip,
        sc_gu_u,
      );

      // get a list of newsletters to update that have changed from the users current subscription
      // if they have changed then set them to subscribe/unsubscribe
      const newsletterSubscriptionsToUpdate =
        newslettersSubscriptionsFromFormBody(body).filter((newSubscription) => {
          // find current user subscription status for a newsletter
          const currentSubscription = userNewsletterSubscriptions.find(
            ({ id: userNewsletterId }) =>
              userNewsletterId === newSubscription.id,
          );

          // check if a subscription exists
          if (currentSubscription) {
            if (
              // previously subscribed AND now wants to unsubscribe
              (currentSubscription.subscribed && !newSubscription.subscribed) ||
              // OR previously not subscribed AND wants to subscribe
              (!currentSubscription.subscribed && newSubscription.subscribed)
            ) {
              // then include in newsletterSubscriptionsToUpdate
              return true;
            }
          }

          // otherwise don't include in the update
          return false;
        });

      await patchNewsletters(ip, sc_gu_u, newsletterSubscriptionsToUpdate);
    },
  },
  {
    page: 'data',
    path: '/consents/data',
    pageTitle: CONSENTS_PAGES.YOUR_DATA,
    read: async (ip, sc_gu_u) => ({
      consents: await getUserConsentsForPage(CONSENTS_DATA_PAGE, ip, sc_gu_u),
      page: 'data',
      previousPage: 'newsletters',
    }),
    update: async (ip, sc_gu_u, body) => {
      const consents = CONSENTS_DATA_PAGE.map((id) => ({
        id,
        consented: getConsentValueFromRequestBody(id, body),
      }));

      await patchConsents(ip, sc_gu_u, consents);
    },
  },
  {
    page: 'review',
    path: '/consents/review',
    pageTitle: CONSENTS_PAGES.REVIEW,
    read: async (ip, sc_gu_u, geo) => {
      const ALL_CONSENT = [
        ...CONSENTS_DATA_PAGE,
        ...CONSENTS_COMMUNICATION_PAGE,
      ];

      return {
        page: 'review',
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

router.get('/consents', loginMiddleware, (_: Request, res: Response) => {
  const url = addQueryParamsToPath(
    `${consentPages[0].path}`,
    res.locals.queryParams,
  );

  res.redirect(303, url);
});

router.get(
  '/consents/:page',
  loginMiddleware,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;
    const sc_gu_u = req.cookies.SC_GU_U;

    const { emailVerified } = state.queryParams;

    if (emailVerified) {
      state = deepmerge(state, {
        globalMessage: {
          success: VERIFY_EMAIL.SUCCESS,
        },
      });
    }

    const { page } = req.params;
    let status = 200;

    const pageIndex = consentPages.findIndex((elem) => elem.page === page);
    if (pageIndex === -1) {
      const html = fourZeroFourRender(res);
      return res.type('html').status(404).send(html);
    }

    let pageTitle = 'Onboarding';

    try {
      const { read, pageTitle: _pageTitle } = consentPages[pageIndex];
      pageTitle = _pageTitle;

      state = deepmerge(state, {
        pageData: {
          ...(await read(req.ip, sc_gu_u, state.pageData.geolocation)),
        },
      } as RequestState);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const { message, status: errorStatus } =
        error instanceof ApiError ? error : new ApiError();

      status = errorStatus;
      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });
    }

    const html = renderer(
      '/consents/:page',
      {
        requestState: state,
        pageTitle,
      },
      { page },
    );

    trackMetric(consentsPageMetric(page, 'Get', status === 200));

    res
      .type('html')
      .status(status ?? 500)
      .send(html);
  }),
);

router.post(
  '/consents/:page',
  loginMiddleware,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const sc_gu_u = req.cookies.SC_GU_U;

    const { page } = req.params;
    let status = 200;

    const pageIndex = consentPages.findIndex((elem) => elem.page === page);
    if (pageIndex === -1) {
      const html = fourZeroFourRender(res);
      return res.type('html').status(404).send(html);
    }

    let pageTitle = 'Onboarding';

    try {
      const { update, pageTitle: _pageTitle } = consentPages[pageIndex];
      pageTitle = _pageTitle;

      if (update) {
        await update(req.ip, sc_gu_u, req.body);
      }

      trackMetric(consentsPageMetric(page, 'Post', true));

      const url = addQueryParamsToPath(
        `${consentPages[pageIndex + 1].path}`,
        state.queryParams,
      );

      return res.redirect(303, url);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const { message, status: errorStatus } =
        error instanceof ApiError ? error : new ApiError();

      status = errorStatus;
      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });
    }

    trackMetric(consentsPageMetric(page, 'Post', false));

    const html = renderer(
      '/consents/:page',
      {
        pageTitle,
        requestState: state,
      },
      { page },
    );
    res
      .type('html')
      .status(status ?? 500)
      .send(html);
  }),
);

export default router.router;
