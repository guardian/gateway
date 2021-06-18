import { Request, Router } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { Routes } from '@/shared/model/Routes';

const router = Router();

router.get(
  Routes.OAUTH_CALLBACK,
  (req: Request, res: ResponseWithRequestState) => {
    console.log({
      query: req.query,
      params: req.params,
      body: req.body,
      headers: req.headers,
      cookies: req.cookies,
      signedCookies: req.signedCookies,
    });
    return res.sendStatus(200);
  },
);

export default router;
