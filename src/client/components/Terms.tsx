import React from 'react';
import { css } from '@emotion/react';
import { background, neutral, space } from '@guardian/src-foundations';
import { Link } from '@guardian/src-link';
import { Checkbox } from '@guardian/src-checkbox';
import { Accordion, AccordionRow } from '@guardian/src-accordion';
import { textSans } from '@guardian/src-foundations/typography';
import { FontWeight } from '@guardian/src-foundations/dist/types/typography/types';

const Container = ({ children }: { children: React.ReactNode }) => (
  <div
    css={css`
      background-color: ${background.secondary};
      width: 100%;
      padding-left: ${space[3]}px;
      padding-right: ${space[3]}px;
      padding-top: ${space[4]}px;
      padding-bottom: ${space[24]}px;
    `}
  >
    {children}
  </div>
);

const Title = ({ children }: { children: React.ReactNode }) => (
  <header
    css={css`
      ${textSans.medium({ fontWeight: 'bold' })}
    `}
  >
    {children}
  </header>
);

const Text = ({ children }: { children: React.ReactNode }) => (
  <p
    css={css`
      ${textSans.small()}
      margin-top: ${space[4]}px;
      margin-bottom: ${space[4]}px;
    `}
  >
    {children}
  </p>
);

const TermsLink = ({
  children,
  fontWeight = 'regular',
  size,
}: {
  children: React.ReactNode;
  fontWeight?: FontWeight;
  size?: 'small' | 'medium';
}) => (
  <Link
    cssOverrides={css`
      ${size === 'medium'
        ? textSans.medium({ fontWeight })
        : textSans.small({ fontWeight })}
      color: ${neutral[0]};
      :hover {
        color: ${neutral[0]};
      }
      font-size: ${size && `${size}px`};
    `}
  >
    {children}
  </Link>
);

export const Terms = () => (
  <Container>
    <Title>
      By proceeding you agree to our{' '}
      <TermsLink fontWeight="bold" size="medium">
        Terms and Conditions
      </TermsLink>
    </Title>
    <Text>
      You also confirm that you are 13 years or older, or that you have the
      consent of your parent or a person holding parental responsibility
    </Text>
    <Text>
      This site is protected by reCAPTCHA and{' '}
      <TermsLink>Google&apos;s Privacy Policy</TermsLink> and{' '}
      <TermsLink>Terms of Service</TermsLink> apply.
    </Text>
    <Text>
      When you&apos;re signed in, we would like to use the data you share with
      us to understand you better. This way we can let you know about Guardian
      products that are more relevant to you. If you&apos;d rather we
      didn&apos;t do this you can opt out below.
    </Text>
    <Checkbox value="opt-out" label="No thank you" />
    <br />
    <Accordion hideToggleLabel={true}>
      <AccordionRow label="How we use your data">
        TODO: Insert some copy here
      </AccordionRow>
      <></>
    </Accordion>
  </Container>
);
