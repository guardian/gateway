import React, { useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Routes } from '@/shared/model/Routes';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { form, textInput, button } from '@/client/styles/Shared';
import { SignInLayout } from '@/client/layouts/SignInLayout';
import { CsrfFormField } from '@/client/components/CsrfFormField';

export const ChangePasswordPage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '', fieldErrors = [] } = {} } = clientState;
  const { token } = useParams<{ token: string }>();

  return (
    <SignInLayout>
      <PageBox>
        <PageHeader>Reset Password</PageHeader>
        <PageBody>
          <PageBodyText>
            Please enter your new password for {email}
          </PageBodyText>
          <form
            css={form}
            method="post"
            action={`${Routes.CHANGE_PASSWORD}/${token}${search}`}
          >
            <CsrfFormField />

            <TextInput
              css={textInput}
              label="New Password"
              supporting="Between 8 and 72 characters"
              name="password"
              type="password"
              error={
                fieldErrors.find(
                  (fieldError) => fieldError.field === 'password',
                )?.message
              }
            />
            <TextInput
              css={textInput}
              label="Repeat Password"
              name="password_confirm"
              type="password"
              error={
                fieldErrors.find(
                  (fieldError) => fieldError.field === 'password_confirm',
                )?.message
              }
            />
            <Button
              css={button}
              type="submit"
              icon={<SvgArrowRightStraight />}
              iconSide="right"
            >
              Save Password
            </Button>
          </form>
        </PageBody>
      </PageBox>
    </SignInLayout>
  );
};
