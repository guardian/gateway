import { NextFunction, Request, Response } from 'express';

export const oktaDevMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // used by local nginx config to determine
  // which okta backend to route to
  // see https://github.com/guardian/identity-platform/pull/505
  if (
    process.env.GU_OKTA_ENV_COOKIE &&
    req.cookies.gu_okta_env !== process.env.GU_OKTA_ENV_COOKIE
  ) {
    res.cookie('gu_okta_env', process.env.GU_OKTA_ENV_COOKIE);
  }
  next();
};
