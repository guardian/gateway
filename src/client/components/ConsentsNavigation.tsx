import React from 'react';
import { css } from '@emotion/react';
import {
  Button,
  LinkButton,
  SvgArrowLeftStraight,
  SvgArrowRightStraight,
} from '@guardian/source-react-components';

import useClientState from '@/client/lib/hooks/useClientState';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { controls } from '@/client/styles/Consents';

const navigationControls = css`
  display: flex;
  justify-content: space-between;
`;

interface ConsentsNavigationProps {
  showContinueButton?: boolean;
}

export const ConsentsNavigation = ({
  showContinueButton = true,
}: ConsentsNavigationProps) => {
  const clientState = useClientState();
  const {
    pageData = {},
    globalMessage: { error } = {},
    queryParams,
  } = clientState;
  const { previousPage } = pageData;

  return (
    <div css={controls}>
      <div css={navigationControls}>
        {previousPage && (
          <LinkButton
            iconSide="left"
            icon={<SvgArrowLeftStraight />}
            href={buildUrlWithQueryParams(
              '/consents/:page',
              {
                page: previousPage,
              },
              queryParams,
            )}
            priority="tertiary"
          >
            Go back
          </LinkButton>
        )}
        {!error && showContinueButton && (
          <Button
            iconSide="right"
            nudgeIcon={true}
            icon={<SvgArrowRightStraight />}
            type="submit"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};
