import { Request } from 'express';
import { typedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { stringify } from 'query-string';

router.get(
  '/login/login.htm',
  (req: Request, res: ResponseWithRequestState) => {
    // TODO: parse and type up the query params
    // specifically the fromURI param
    const string = stringify(req.query);

    return res.redirect(`/signin?useOkta=true&${string}`);
  },
);

export default router.router;
