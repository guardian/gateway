import * as React from 'react';
import { css } from '@emotion/react';
import {
  brandBackground,
  space,
  text,
  brandAltBackground,
  brandLine,
} from '@guardian/src-foundations';
import { headline } from '@guardian/src-foundations/typography';
import { Container } from '@/client/components/Container';
import { from } from '@guardian/src-foundations/mq';
import { Link } from '@guardian/src-link';

type Props = {
  tabs: TabType[];
};

type TabType = {
  displayText: string;
  linkTo: string;
  isActive?: boolean;
  isFirst?: boolean;
};

const backgroundStyles = css`
  background-color: ${brandBackground.primary};
`;

const tabRowStyles = css`
  display: flex;
  flex-direction: row;
  margin: 0;
`;

const forceActiveBar = css`
  :after {
    transform: translateY(5px);
  }
`;

const activeBarStyles = css`
  overflow: hidden;
  position: relative;
  :after {
    border-top: 4px solid ${brandAltBackground.primary};
    left: 0;
    right: 0;
    top: -5px;
    content: '';
    display: block;
    position: absolute;
    transition: transform 0.3s ease-in-out;
  }
`;

const tabPaddingStyles = (isFirst?: boolean) => {
  if (isFirst) {
    return css`
      padding-left: 12px;
      ${from.tablet} {
        padding-left: 20px;
      }
    `;
  }
  return css`
    padding-left: 9px;
  `;
};

const tabDividerStyles = css`
  :before {
    content: '';
    display: block;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: ${brandLine.primary};
    ${from.tablet} {
      bottom: 13px;
    }
  }
`;

const tabStyles = css`
  /* Spacing */
  padding-top: ${space[2]}px;
  padding-bottom: ${space[1]}px;
  padding-right: 20px;
  min-width: 80px;
  ${from.tablet} {
    min-width: 160px;
  }

  /* Text */
  color: ${text.ctaPrimary};
  ${headline.xxxsmall({ fontWeight: 'bold', lineHeight: 'tight' })}
  ${from.tablet} {
    ${headline.xsmall({ fontWeight: 'bold', lineHeight: 'regular' })}
  }

  /* a tag overrides */
  text-decoration: none;
  :hover {
    color: ${text.ctaPrimary};
    text-decoration: none;
  }

  /* When to show active bar */
  :focus:after {
    transform: translateY(5px);
  }
  :hover:after {
    transform: translateY(5px);
  }
`;

const Tab = ({ displayText, linkTo, isActive, isFirst }: TabType) => {
  return (
    <Link
      href={linkTo}
      css={[
        tabStyles,
        tabPaddingStyles(isFirst),
        activeBarStyles,
        tabDividerStyles,
        isActive && forceActiveBar,
      ]}
    >
      {displayText}
    </Link>
  );
};

export const Nav = ({ tabs }: Props) => (
  <nav css={backgroundStyles}>
    <Container sideBorders={true} topBorder={true} sidePadding={false}>
      <h1 css={tabRowStyles}>
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            displayText={tab.displayText}
            linkTo={tab.linkTo}
            isActive={tab.isActive}
            isFirst={index === 0}
          />
        ))}
      </h1>
    </Container>
  </nav>
);
