import { Request } from 'express';
import { parse, stringify } from 'query-string';
import ms from 'ms';
import { getConfiguration } from '@/server/lib/getConfiguration';

import { ResponseWithRequestState } from '@/server/models/Express';

const RAN_EXPERIMENTS_COOKIE_NAME = 'GU_ran_experiments';
const { isHttps } = getConfiguration();

const getRanExperiments = (req: Request) => {
  const ranExperimentsValue = req.cookies[RAN_EXPERIMENTS_COOKIE_NAME];

  if (!ranExperimentsValue) return {};

  return parse(ranExperimentsValue);
};

export const hasExperimentRun = (req: Request, experimentId: string) => {
  const ranExperiments = getRanExperiments(req);
  return experimentId in ranExperiments;
};

export const setExperimentRan = (
  req: Request,
  res: ResponseWithRequestState,
  experimentId: string,
  ran: boolean,
) => {
  const ranExperiments = getRanExperiments(req);
  let newExperiments = {};

  if (ran) {
    newExperiments = {
      ...ranExperiments,
      [experimentId]: Date.now(),
    };
  } else {
    // Using destructuring to omit property, so extracted variable is unused
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [experimentId]: omit, ...otherExperiments } = ranExperiments;
    newExperiments = otherExperiments;
  }
  const newValue = stringify(newExperiments);
  res.cookie(RAN_EXPERIMENTS_COOKIE_NAME, newValue, {
    httpOnly: true,
    maxAge: ms('1yr'),
    sameSite: 'strict',
    secure: isHttps,
  });
};
