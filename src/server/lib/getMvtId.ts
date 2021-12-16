import { Request } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';

export const getMvtId = (request: Request): number => {
  const { cookies } = request;
  if (cookies['GU_mvt_id_local'] && getConfiguration().stage === 'DEV') {
    return Number(cookies['GU_mvt_id_local']) || 0;
  }

  if (cookies['GU_mvt_id']) {
    return Number(cookies['GU_mvt_id']) || 0;
  }

  return 0;
};
