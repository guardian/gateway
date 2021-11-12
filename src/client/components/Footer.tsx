import React from 'react';
import { css } from '@emotion/react';
import {
  brand,
  brandText,
  brandAlt,
  brandBackground,
} from '@guardian/src-foundations/palette';
import { space } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';
import { Hide } from '@guardian/src-layout';
import locations from '@/client/lib/locations';
import { BackToTop } from '@/client/components/BackToTop';
import { Container } from '@/client/components/Container';
import { ExternalLink } from '@/client/components/ExternalLink';

const footer = css`
  background-color: ${brandBackground.primary};
  color: ${brandText.primary};
  padding-bottom: ${space[1]}px;
  ${textSans.medium()};
`;

const ulWrapperStyles = css`
  display: flex;
  position: relative;
`;

const linkStyles = css`
  text-decoration: none;
  padding-bottom: 10px;
  display: block;
  line-height: 19px;
  color: ${brandText.primary};
  font-size: 15px;

  :hover {
    text-decoration: underline;
    color: ${brandAlt[400]};
  }

  ${from.mobileMedium} {
    font-size: 17px;
  }

  ${from.desktop} {
    padding-bottom: 0;
  }
`;

const ulStyles = css`
  list-style: none;
`;

const columnStyles = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: ${space[3]}px;
  padding-right: 0;
  padding-bottom: 50px;
  padding-left: 0;
  margin-top: 0;
  margin-right: ${space[3]}px;
  margin-bottom: 0px;
  margin-left: 0;

  ${from.tablet} {
    flex: 0 0 160px;
    padding-top: 10px;
    padding-bottom: 26px;
    margin-right: 0;
  }

  ${from.desktop} {
    padding-bottom: ${space[6]}px;
    flex: 0 0 160px;

    :first-of-type {
      /* The first column on desktop
      is slightly shorter as it ends
      halfway (10px) into the grid
      column gap between col 2 and 3.
      
      This also means that the rest of
      the footer items line up with
      the border in the column gap
      and the text at the start of the
      column;
      */
      flex: 0 0 150px;
    }
  }
`;

const leftBorderStyles = css`
  padding-left: ${space[3]}px;

  ::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 21px;
    border-left: 1px solid ${brand[600]};
    margin-left: -${space[3]}px;
  }

  ${from.desktop} {
    padding-left: 10px;

    ::before {
      margin-left: -10px;
    }
  }
`;

const copyrightStyles = css`
  ${textSans.xxsmall()};

  padding-top: ${space[6]}px !important;
  padding-bottom: 18px !important;
  ${from.tablet} {
    padding-top: ${space[3]}px !important;
  }
`;

const backToTopStyles = css`
  background-color: ${brandBackground.primary};
  padding: 0 ${space[2]}px;
  position: absolute;
  bottom: -21px;
  right: ${space[3]}px;

  ${from.tablet} {
    padding: 0 5px;
    right: 0;
  }
`;

export const Footer = () => (
  <footer css={footer}>
    {/* What you see below desktop */}
    <Hide above="desktop">
      <Container sideBorders>
        <div css={ulWrapperStyles}>
          <ul css={[ulStyles, columnStyles]}>
            <li>
              <ExternalLink cssOverrides={linkStyles} href={locations.PRIVACY}>
                Privacy policy
              </ExternalLink>
            </li>
            <li>
              <ExternalLink
                cssOverrides={linkStyles}
                href={locations.CONTACT_US}
              >
                Contact us
              </ExternalLink>
            </li>
          </ul>
          <ul css={[ulStyles, columnStyles, leftBorderStyles]}>
            <li>
              <ExternalLink cssOverrides={linkStyles} href={locations.HELP}>
                Help
              </ExternalLink>
            </li>
            <li>
              <ExternalLink cssOverrides={linkStyles} href={locations.TERMS}>
                Terms &amp; conditions
              </ExternalLink>
            </li>
          </ul>
          <div css={backToTopStyles}>
            <BackToTop />
          </div>
        </div>
      </Container>
    </Hide>
    {/* What you see above desktop */}
    <Hide below="desktop">
      <Container sideBorders>
        <div css={ulWrapperStyles}>
          <ul css={[ulStyles, columnStyles]}>
            <li>
              <ExternalLink cssOverrides={linkStyles} href={locations.PRIVACY}>
                Privacy policy
              </ExternalLink>
            </li>
          </ul>
          <ul css={[ulStyles, columnStyles, leftBorderStyles]}>
            <li>
              <ExternalLink
                cssOverrides={linkStyles}
                href={locations.CONTACT_US}
              >
                Contact us
              </ExternalLink>
            </li>
          </ul>
          <ul css={[ulStyles, columnStyles, leftBorderStyles]}>
            <li>
              <ExternalLink cssOverrides={linkStyles} href={locations.HELP}>
                Help
              </ExternalLink>
            </li>
          </ul>
          <ul css={[ulStyles, columnStyles, leftBorderStyles]}>
            <li>
              <ExternalLink cssOverrides={linkStyles} href={locations.TERMS}>
                Terms &amp; conditions
              </ExternalLink>
            </li>
          </ul>
          <div css={backToTopStyles}>
            <BackToTop />
          </div>
        </div>
      </Container>
    </Hide>
    <Container topBorder={true} sideBorders={false}>
      <div css={[copyrightStyles]}>
        © {new Date().getFullYear()} Guardian News & Media Limited or its
        affiliated companies. All rights reserved.
      </div>
    </Container>
  </footer>
);
