import { Request } from 'express';
import { Configuration } from '../models/Configuration';

export const getMvtId = (
  request: Request,
  configuration: Configuration,
): number => {
  const { cookies } = request;
  const { stage } = configuration;
  if (cookies['GU_mvt_id_local'] && stage === 'DEV') {
    return Number(cookies['GU_mvt_id_local']) || 0;
  }

  if (cookies['GU_mvt_id']) {
    return Number(cookies['GU_mvt_id']) || 0;
  }

  return 0;
};
