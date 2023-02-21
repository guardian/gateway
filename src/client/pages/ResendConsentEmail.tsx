import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainLayout } from '@/client/layouts/Main';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import {
  Button,
  SvgArrowRightStraight,
} from '@guardian/source-react-components';
import { QueryParams } from '@/shared/model/QueryParams';

interface Props {
  token: string;
  queryParams: QueryParams;
}

export const ResendConsentEmail = ({ token, queryParams }: Props) => {
  return (
    <MainLayout pageHeader="Link expired">
      <MainBodyText>This link has expired.</MainBodyText>
      <MainBodyText>To receive a new link, please click below.</MainBodyText>
      <form
        method="post"
        action={buildUrlWithQueryParams(
          '/consent-token/resend',
          {},
          queryParams,
        )}
      >
        <CsrfFormField />
        <input type="hidden" name="token" value={token} />
        <Button type="submit" icon={<SvgArrowRightStraight />} iconSide="right">
          Resend link
        </Button>
      </form>
    </MainLayout>
  );
};
