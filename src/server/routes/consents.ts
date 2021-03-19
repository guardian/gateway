import { Router, Request, Response } from 'express';
import { Routes } from '@/shared/model/Routes';
import { redirectRenderer, renderer } from '@/server/lib/renderer';
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
import {
  RequestState,
  ResponseWithRequestState,
} from '@/server/models/Express';
import { VERIFY_EMAIL } from '@/shared/model/Success';
import { trackMetric } from '@/server/lib/AWS';
import { consentsPageMetric } from '@/server/models/Metrics';
import { addReturnUrlToPath } from '@/server/lib/queryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import { NewsletterMap } from '@/shared/lib/newsletter';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { fourZeroFourRender } from '@/server/lib/middleware/404';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { IDAPIError } from '../lib/APIFetch';
import { getConfiguration } from '../lib/getConfiguration';
import { Configuration } from '../models/Configuration';

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

//  ABTEST: followupConsent : Start
// The following routes and functions are only used as part of the followupConsents AB test

function getErrorResponse(
  e: Error | IDAPIError,
  state: RequestState,
): [number, RequestState] {
  let status;
  let message;
  // TODO: Object check needed
  if ('status' in e && 'error' in e) {
    status = e.status;
    message = e.error;
  } else {
    status = 500;
    message = 'TODO: General Error';
  }
  return [
    status,
    {
      ...state,
      globalMessage: {
        ...state.globalMessage,
        error: message,
      },
    },
  ];
}

enum IDAPIEntity {
  NEWSLETTERS = 'newsletters',
  CONSENTS = 'consents',
}
type IDAPIEntityRecord = [IDAPIEntity, NewsLetter[] | Consent[]];
type IDAPIEntityGetter = (
  ip: string,
  sc_gu_u: string,
  geocode?: GeoLocation,
) => Promise<IDAPIEntityRecord>;

function isSubscribed(entities: NewsLetter[] | Consent[]): boolean {
  if (entities.length < 1) {
    return false;
  }
  const entity = entities[0];
  if ('subscribed' in entity) {
    return entity?.subscribed ?? false;
  }
  if ('consented' in entity) {
    return entity?.consented ?? false;
  }
  return false;
}

function getRedirectUrl(config: Configuration, state: RequestState): string {
  return state?.queryParams?.returnUrl ?? config.defaultReturnUri;
}

async function getNewsletterEntity(
  ip: string,
  sc_gu_u: string,
  geocode?: GeoLocation,
): Promise<[IDAPIEntity, NewsLetter[]]> {
  const newsletters = (
    await getUserNewsletterSubscriptions(
      NewsletterMap.get(geocode) as string[],
      ip,
      sc_gu_u,
    )
  ).slice(0, 1); // Assume 'Today' newsletter is the leading newsletter in NewsletterMap;
  return [IDAPIEntity.NEWSLETTERS, newsletters];
}

function getABTestGETHandler(entityGetter: IDAPIEntityGetter) {
  return async (req: Request, res: ResponseWithRequestState) => {
    const { ip, cookies } = req;
    const sc_gu_u = cookies.SC_GU_U;
    let state = res.locals;
    let status = 200;
    const geocode = state.pageData.geolocation;
    try {
      const [entitiesName, entities] = await entityGetter(ip, sc_gu_u, geocode);
      if (isSubscribed(entities)) {
        res.redirect(303, getRedirectUrl(getConfiguration(), state));
      }
      state = {
        ...state,
        pageData: {
          ...state.pageData,
          [entitiesName]: entities,
          returnUrl: state?.queryParams?.returnUrl,
        },
      };
    } catch (error) {
      [status, state] = getErrorResponse(error, state);
    }

    const html = renderer(`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP}`, {
      requestState: state,
      pageTitle: 'Get the headlines in your inbox', // TODO: Changes on marketing variant
    });

    res.type('html').status(status).send(html);
  };
}

router.get(
  `${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP}`,
  loginMiddleware,
  getABTestGETHandler(getNewsletterEntity),
);

router.post(
  `${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP}`,
  loginMiddleware,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;
    const sc_gu_u = req.cookies.SC_GU_U;

    let status = 200;
    const url = getRedirectUrl(getConfiguration(), state);
    try {
      const { update } = consentPages[1]; // Can reuse newsletter updater function.
      if (update) {
        await update(req.ip, sc_gu_u, req.body, state.pageData.geolocation);
      } else {
        throw 'Follow On Consent Update Failure';
      }
      const html = redirectRenderer(url);
      res.type('html').send(html);
      return;
    } catch (e) {
      [status, state] = getErrorResponse(e, state);
    }

    const html = renderer(`${Routes.CONSENTS}${Routes.CONSENTS_FOLLOW_UP}`, {
      pageTitle: 'Get the headlines in your inbox', // TODO: Changes on marketing variant
      requestState: state,
    });
    res
      .type('html')
      .status(status ?? 500)
      .send(html);
  }),
);

//  ABTEST: followupConsent : END

router.get(
  `${Routes.CONSENTS}/:page`,
  loginMiddleware,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;
    const sc_gu_u = req.cookies.SC_GU_U;

    const { emailVerified } = state.queryParams;

    if (emailVerified) {
      state = {
        ...state,
        globalMessage: {
          ...state.globalMessage,
          success: VERIFY_EMAIL.SUCCESS,
        },
      };
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

      state = {
        ...state,
        pageData: {
          ...(await read(req.ip, sc_gu_u, state.pageData.geolocation)),
          returnUrl: state?.queryParams?.returnUrl,
        },
      };
    } catch (e) {
      status = e.status;
      state = {
        ...state,
        globalMessage: {
          ...state.globalMessage,
          error: e.message,
        },
      };
    }

    const html = renderer(`${Routes.CONSENTS}/${page}`, {
      requestState: state,
      pageTitle,
    });

    trackMetric(consentsPageMetric(page, 'Get', status === 200));

    res
      .type('html')
      .status(status ?? 500)
      .send(html);
  }),
);

router.post(
  `${Routes.CONSENTS}/:page`,
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
        await update(req.ip, sc_gu_u, req.body, state.pageData.geolocation);
      }

      trackMetric(consentsPageMetric(page, 'Post', true));

      let url = `${Routes.CONSENTS}/${consentPages[pageIndex + 1].page}`;
      if (state?.queryParams?.returnUrl) {
        url = addReturnUrlToPath(url, state.queryParams.returnUrl);
      }
      return res.redirect(303, url);
    } catch (e) {
      status = e.status;
      state = {
        ...state,
        globalMessage: {
          ...state.globalMessage,
          error: e.message,
        },
      };
    }

    trackMetric(consentsPageMetric(page, 'Post', false));

    const html = renderer(`${Routes.CONSENTS}/${page}`, {
      pageTitle,
      requestState: state,
    });
    res
      .type('html')
      .status(status ?? 500)
      .send(html);
  }),
);

export default router;
