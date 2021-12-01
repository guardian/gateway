import * as React from 'react';
import { css } from '@emotion/react';
import {
  brandBackground,
  text,
  brandAltBackground,
  brandLine,
  headline,
  from,
} from '@guardian/source-foundations';
import { Container } from '@/client/components/Container';
import { RoutePaths } from '@/shared/lib/routeUtils';
import { Link } from '@guardian/source-react-components';

type Props = {
  tabs: TabType[];
};

type TabType = {
  displayText: string;
  linkTo: RoutePaths;
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

const tabPaddingMarginStyles = (isFirst?: boolean) => {
  if (isFirst) {
    return css`
      padding-left: 10px;
      ${from.mobileLandscape} {
        padding-left: 20px;
      }
      ${from.desktop} {
        padding-left: 10px;
        margin-left: 90px;
      }
      ${from.leftCol} {
        margin-left: 170px;
      }
      ${from.wide} {
        margin-left: 250px;
      }
    `;
  }
  return css`
    padding-left: 10px;
  `;
};

const tabDividerStyles = (isFirst?: boolean) => {
  const dividerStyles = css`
    :before {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: ${brandLine.primary};
      ${from.tablet} {
        bottom: 18px;
      }
      ${from.desktop} {
        bottom: 12px;
      }
    }
  `;

  if (isFirst) {
    return css`
      ${from.desktop} {
        ${dividerStyles}
      }
    `;
  }
  return dividerStyles;
};

const tabStyles = css`
  /* Spacing */
  padding-top: 9px;

  /* Sizing/Height */
  height: 36px;
  ${from.tablet} {
    height: 48px;
  }
  ${from.desktop} {
    height: 42px;
  }

  /* Flexbox/Width */
  flex: 1 1 0px;
  ${from.tablet} {
    flex: 0 1 130px;
  }
  ${from.desktop} {
    flex: 0 1 160px;
  }

  /* Text */
  color: ${text.ctaPrimary};
  ${headline.xxxsmall({ fontWeight: 'bold', lineHeight: 'tight' })}
  font-size: 15.4px;

  ${from.mobileMedium} {
    font-size: 15.7px;
  }
  ${from.mobileLandscape} {
    font-size: 18px;
  }
  ${from.tablet} {
    font-size: 22px;
  }
  ${from.wide} {
    font-size: 24px;
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
        tabPaddingMarginStyles(isFirst),
        activeBarStyles,
        tabDividerStyles(isFirst),
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
