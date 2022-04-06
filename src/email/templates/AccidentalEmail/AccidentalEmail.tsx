import React from 'react';

import { Mjml, MjmlBody, MjmlHead, MjmlTitle, MjmlStyle } from 'mjml-react';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const AccidentalEmail = () => {
  return (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>Please ignore this email | The Guardian</MjmlTitle>
        <MjmlStyle
          inline={true}
        >{`.accidental-email-cta { display: [[CTA_DISPLAY]]; }`}</MjmlStyle>
      </MjmlHead>
      <MjmlBody width={600}>
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
        <Text cssClass="accidental-email-cta">{'{{CTA}}'}</Text>
        <Footer />
      </MjmlBody>
    </Mjml>
  );
};
