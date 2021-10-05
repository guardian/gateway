import React from 'react';
import { css } from '@emotion/react';
import { Container as SourceContainer } from '@guardian/src-layout';
import { brandLine } from '@guardian/src-foundations/palette';
import { from } from '@guardian/src-foundations/mq';

type Props = {
  children: React.ReactNode; // Children are inserted inside the nested div of the section
  sidePadding?: boolean; // Should side padding be added to the content inside the container (nested div)
  topBorder?: boolean; // Show top border
  sideBorders?: boolean; // Show left and right borders
  borderColor?: string; // Set the colour for borders
  backgroundColor?: string; // Sets the background colour of the section (root) element
};

const sidePaddingStyles = css`
  > div {
    padding-left: 10px;
    padding-right: 10px;
    ${from.mobileLandscape} {
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
