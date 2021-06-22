import React from 'react';
import { css } from '@emotion/react';
import { Container as SourceContainer } from '@guardian/src-layout';
import { brandLine } from '@guardian/src-foundations/palette';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';

type Props = {
  children: React.ReactNode;
  sidePadding?: boolean;
  topBorder?: boolean;
  sideBorders?: boolean;
  borderColor?: string;
  backgroundColor?: string;
};

const sidePaddingStyles = css`
  > div {
    padding-left: ${space[3]}px;
    padding-right: ${space[3]}px;
    ${from.tablet} {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
`;

const noPaddingStyles = css`
  > div {
    padding: 0;
  }
`;

const sideBorderColors = (color: string) => css`
  border-left-color: ${color} !important;
  border-right-color: ${color};
`;

export const Container = ({
  children,
  sidePadding = true,
  topBorder,
  sideBorders,
  borderColor = brandLine.primary,
  backgroundColor,
}: Props) => {
  return (
    <SourceContainer
      sideBorders={sideBorders}
      topBorder={topBorder}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      cssOverrides={[
        sidePadding ? sidePaddingStyles : noPaddingStyles,
        sideBorders ? sideBorderColors(borderColor) : css``,
      ]}
    >
      {children}
    </SourceContainer>
  );
};
