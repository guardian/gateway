import React from 'react';

import { Page } from '@/email/components/Page';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const AccidentalEmail = () => {
  return (
    <Page title="No account">
      <Header />
      <SubHeader>Please ignore this email</SubHeader>
      <Text>Hello,</Text>
      <Text>
        We&apos;re doing some housekeeping and will be moving your contact
        details over to a more secure system soon. Don&apos;t worry, your
        details are safe with us, we just want to make sure that we&apos;re
        using the most up to date security that we possibly can.
      </Text>
      <Text>
        This email has been triggered accidentally. You don&apos;t have to do
        anything in response and you haven&apos;t been added onto any mailing
        list. We&apos;re very sorry for bothering you.
      </Text>
      <Footer />
    </Page>
  );
};
