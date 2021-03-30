import { SerializedStyles } from '@emotion/react';
import React from 'react';

interface Props {
  width?: string;
  cssOverrides?: SerializedStyles | SerializedStyles[];
  invertColors?: boolean;
}
const defaultColorScheme = {
  card: '#C1D8FC',
  envelopeFrame: 'white',
  envelopeFront: '#052962',
  roundelBackground: 'white',
  roundelText: '#052962',
};

const invertedColorScheme = {
  card: '#C1D8FC',
  envelopeFrame: '#052962',
  envelopeFront: 'white',
  roundelBackground: 'white',
  roundelText: '#052962',
};

const getColorScheme = (invert = false) =>
  invert ? invertedColorScheme : defaultColorScheme;

export const EnvelopeImage = (props: Props) => {
  const colors = getColorScheme(props.invertColors);
  return (
    <svg
      css={props.cssOverrides}
      width={props.width}
      viewBox="0 0 159 149"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M79.1965 2.93455L4.17373 56.581C3.12353 57.3319 2.50037 58.5436 2.50037 59.8347V127.724C2.50037 129.933 4.29123 131.724 6.50036 131.724H153.318C155.527 131.724 157.318 129.933 157.318 127.724V59.7831C157.318 58.521 156.722 57.3328 155.711 56.5778L83.916 2.98291C82.521 1.94152 80.6126 1.92197 79.1965 2.93455Z"
        stroke={colors.envelopeFrame}
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x="7.72961"
        y="26.219"
        width="144.358"
        height="85.1515"
        fill={colors.card}
        stroke={colors.card}
        vectorEffect="non-scaling-stroke"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M80.5002 41C61.4465 41 46 56.4459 46 75.5C46 94.5539 61.4465 110 80.5002 110C99.554 110 115 94.5539 115 75.5C115 56.4459 99.554 41 80.5002 41Z"
        fill={colors.roundelBackground}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M101.36 77.3905L97.8191 78.9736V95.3029C95.8271 97.2004 90.7365 100.158 85.8672 101.174V99.9878V97.7616V78.6176L82.1046 77.2884V76.3021H101.36V77.3905ZM83.7093 50.192C83.7093 50.192 83.6366 50.1914 83.6007 50.1914C75.6177 50.1914 71.0508 60.9551 71.2809 75.4742C71.0508 90.046 75.6177 100.81 83.6007 100.81C83.6366 100.81 83.7093 100.809 83.7093 100.809V101.928C71.7412 102.728 55.4002 93.8118 55.6303 75.5267C55.4002 57.1891 71.7412 48.2729 83.7093 49.0731V50.192ZM86.1159 49.0229C90.7961 49.7377 96.145 52.8115 98.1508 54.9937V65.0694H96.9983L86.1159 50.1348V49.0229Z"
        fill={colors.roundelText}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M2.31677 54.1455C2.31677 52.0325 4.77547 50.8724 6.40633 52.2159L76.4114 109.885C78.4425 111.558 81.3743 111.558 83.4054 109.885L153.41 52.2159C155.041 50.8724 157.5 52.0325 157.5 54.1455V131.36C157.5 132.017 157.242 132.647 156.781 133.115L143.607 146.484C143.137 146.961 142.495 147.23 141.826 147.23H18.6237C17.9729 147.23 17.3478 146.976 16.8812 146.522L3.0743 133.102C2.59001 132.632 2.31677 131.985 2.31677 131.31V54.1455Z"
        fill={colors.envelopeFront}
        stroke={colors.envelopeFrame}
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
