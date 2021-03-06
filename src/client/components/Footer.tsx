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
import { from, until } from '@guardian/src-foundations/mq';
import { Link } from '@guardian/src-link';
import { Hide } from '@guardian/src-layout';
import locations from '@/client/lib/locations';
import { BackToTop } from '@/client/components/BackToTop';
import { Container } from '@/client/components/Container';

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
  padding-bottom: ${space[3]}px;
  display: block;
  line-height: 19px;
  color: ${brandText.primary};

  :hover {
    text-decoration: underline;
    color: ${brandAlt[400]};
  }
`;

const ulStyles = css`
  list-style: none;
`;

const columnStyles = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-top: ${space[3]}px;
  padding-right: 0;
  padding-bottom: 0;
  padding-left: 0;
  margin-top: 0;
  margin-right: ${space[3]}px;
  margin-bottom: ${space[6]}px;
  margin-left: 0;
`;

const leftBorderStyles = css`
  border-left: 1px solid ${brand[600]};
  padding-left: ${space[3]}px;
  ${from.tablet} {
    padding-left: 20px;
  }
`;

const copyrightStyles = css`
  ${textSans.xxsmall()};

  padding-top: ${space[3]}px !important;
  padding-bottom: ${space[3]}px !important;
  ${until.tablet} {
    padding-top: ${space[6]}px !important;
  }
`;

const backToTopStyles = css`
  background-color: ${brandBackground.primary};
  padding: 0 ${space[2]}px;
  position: absolute;
  bottom: -21px;
  right: ${space[3]}px;
`;

export const Footer = () => (
  <footer css={footer}>
    {/* What you see below tablet */}
    <Hide above="tablet">
      <Container sideBorders={true}>
        <div css={ulWrapperStyles}>
          <ul css={[ulStyles, columnStyles]}>
            <li>
              <Link cssOverrides={linkStyles} href={locations.PRIVACY}>
                Privacy policy
              </Link>
            </li>
            <li>
              <Link cssOverrides={linkStyles} href={locations.CONTACT_US}>
                Contact us
              </Link>
            </li>
            <li>
              <Link cssOverrides={linkStyles} href={locations.COOKIE_POLICY}>
                Cookie policy
              </Link>
            </li>
          </ul>
          <ul css={[ulStyles, columnStyles, leftBorderStyles]}>
            <li>
              <Link cssOverrides={linkStyles} href={locations.HELP}>
                Help
              </Link>
            </li>
            <li>
              <Link cssOverrides={linkStyles} href={locations.TERMS}>
                Terms and Conditions
              </Link>
            </li>
          </ul>
          <div css={backToTopStyles}>
            <BackToTop />
          </div>
        </div>
      </Container>
    </Hide>
    {/* What you see above tablet */}
    <Hide below="tablet">
      <Container sideBorders={true}>
        <div css={ulWrapperStyles}>
          <ul css={[ulStyles, columnStyles]}>
            <li>
              <Link cssOverrides={linkStyles} href={locations.PRIVACY}>
                Privacy policy
              </Link>
            </li>
          </ul>
          <ul css={[ulStyles, columnStyles, leftBorderStyles]}>
            <li>
              <Link cssOverrides={linkStyles} href={locations.CONTACT_US}>
                Contact us
              </Link>
            </li>
          </ul>
          <ul css={[ulStyles, columnStyles, leftBorderStyles]}>
            <li>
              <Link cssOverrides={linkStyles} href={locations.HELP}>
                Help
              </Link>
            </li>
          </ul>
          <ul css={[ulStyles, columnStyles, leftBorderStyles]}>
            <li>
              <Link cssOverrides={linkStyles} href={locations.TERMS}>
                Terms and Conditions
              </Link>
            </li>
          </ul>
          <ul css={[ulStyles, columnStyles, leftBorderStyles]}>
            <li>
              <Link cssOverrides={linkStyles} href={locations.COOKIE_POLICY}>
                Cookie policy
              </Link>
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
