import React from 'react';
import { css } from '@emotion/react';
import {
  background,
  brandText,
  brandAlt,
  textSans,
  space,
} from '@guardian/source-foundations';
import { Link } from '@guardian/source-react-components';

const iconContainer = css`
  position: relative;
  float: right;
  border-radius: 100%;
  background-color: ${background.primary};
  cursor: pointer;
  height: 42px;
  min-width: 42px;
`;

const linkStyles = css`
  text-decoration: none;
  color: ${brandText.anchorPrimary};
  font-weight: bold;
  line-height: 42px;
  display: flex;
  flex-direction: row;
  width: 133px;

  :hover {
    color: ${brandAlt[400]};

    .back-to-top-icon {
      background-color: ${brandAlt[400]};
    }
  }
`;

const icon = css`
  :before {
    position: absolute;
    top: 6px;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    border: 2px solid ${brandText.ctaPrimary};
    border-bottom: 0;
    border-right: 0;
    content: '';
    height: 12px;
    width: 12px;
    transform: rotate(45deg);
  }
`;

const textStyles = css`
  display: flex;
  align-items: center;
  ${textSans.small({ fontWeight: 'bold' })};
  margin-right: ${space[2]}px;
`;

export const BackToTop: React.FC = () => (
  <Link cssOverrides={linkStyles} href="#top">
    <span css={textStyles}>Back to top</span>
    <span className="back-to-top-icon" css={iconContainer}>
      <i css={icon} />
    </span>
  </Link>
);
