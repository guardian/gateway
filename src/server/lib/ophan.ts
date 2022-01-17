import { OphanEvent, OphanInteraction } from '@/shared/model/ophan';
import { fetch } from '@/server/lib/fetch';
import { logger } from '@/server/lib/serverSideLogger';
import timeoutSignal from 'timeout-signal';
import { stringify } from 'query-string';

const ophanUrl = 'https://ophan.theguardian.com/img/2';

export interface OphanConfig {
  bwid?: string;
  viewId?: string;
  consentUUID?: string;
}

export const record = (event: OphanEvent, config: OphanConfig = {}) => {
  const { bwid, consentUUID, viewId } = config;

  if (bwid && viewId) {
    const query = stringify(
      { viewId, ...event },
      {
        skipNull: true,
        skipEmptyString: true,
      },
    );

    fetch(`${ophanUrl}?${query}`, {
      method: 'GET',
      signal: timeoutSignal(250),
      headers: {
        Cookie: stringify(
          { bwid, consentUUID },
          { skipNull: true, skipEmptyString: true },
        ).replace('&', ';'),
      },
    }).catch((error) => {
      logger.warn(`Ophan: Failed to record Ophan event`, error);
    });
  } else {
    logger.warn(`Ophan: Missing bwid or viewId`);
  }
};

export const sendOphanInteractionEventServer = (
  interaction: OphanInteraction,
  config?: OphanConfig,
) => record(interaction, config);
