import { CSSObject } from "@emotion/core";
import {
  FontFace,
  FontWeightName,
  FontWeightNumber,
  FontStyle,
  FontFamily,
  FontFamilyPath
} from "@/client/models/Font";

// font formats
const formats: string[] = ["woff2", "woff", "ttf"];

// fonts to load on page
const fonts: FontFace[] = [
  {
    family: FontFamily.TITLEPIECE,
    path: `${FontFamilyPath.TITLEPIECE}-${FontWeightName.BOLD}`,
    weight: FontWeightNumber.BOLD
  },
  {
    family: FontFamily.HEADLINE,
    path: `${FontFamilyPath.HEADLINE}-${FontWeightName.BOLD}`,
    weight: FontWeightNumber.BOLD
  },
  {
    family: FontFamily.HEADLINE,
    path: `${FontFamilyPath.HEADLINE}-${FontWeightName.MEDIUM}`,
    weight: FontWeightNumber.MEDIUM
  },
  {
    family: FontFamily.HEADLINE,
    path: `${FontFamilyPath.HEADLINE}-${FontWeightName.MEDIUM}${FontStyle.ITALIC}`,
    weight: FontWeightNumber.MEDIUM,
    style: FontStyle.ITALIC.toLowerCase()
  },
  {
    family: FontFamily.HEADLINE,
    path: `${FontFamilyPath.HEADLINE}-${FontWeightName.LIGHT}`,
    weight: FontWeightNumber.LIGHT
  },
  {
    family: FontFamily.HEADLINE,
    path: `${FontFamilyPath.HEADLINE}-${FontWeightName.LIGHT}${FontStyle.ITALIC}`,
    weight: FontWeightNumber.LIGHT,
    style: FontStyle.ITALIC.toLowerCase()
  },
  {
    family: FontFamily.EGYPTIAN,
    path: `${FontFamilyPath.EGYPTIAN}-${FontWeightName.BOLD}`,
    weight: FontWeightNumber.BOLD
  },
  {
    family: FontFamily.EGYPTIAN,
    path: `${FontFamilyPath.EGYPTIAN}-${FontWeightName.BOLD}${FontStyle.ITALIC}`,
    weight: FontWeightNumber.BOLD,
    style: FontStyle.ITALIC.toLowerCase()
  },
  {
    family: FontFamily.EGYPTIAN,
    path: `${FontFamilyPath.EGYPTIAN}-${FontWeightName.REGULAR}`,
    weight: FontWeightNumber.REGULAR
  },
  {
    family: FontFamily.EGYPTIAN,
    path: `${FontFamilyPath.EGYPTIAN}-${FontWeightName.REGULAR}${FontStyle.ITALIC}`,
    weight: FontWeightNumber.REGULAR,
    style: FontStyle.ITALIC.toLowerCase()
  },
  {
    family: FontFamily.SANS,
    path: `${FontFamilyPath.SANS}-${FontWeightName.BOLD}`,
    weight: FontWeightNumber.BOLD
  },
  {
    family: FontFamily.SANS,
    path: `${FontFamilyPath.SANS}-${FontWeightName.REGULAR}`,
    weight: FontWeightNumber.REGULAR
  },
  {
    family: FontFamily.SANS,
    path: `${FontFamilyPath.SANS}-${FontWeightName.REGULAR}${FontStyle.ITALIC}`,
    weight: FontWeightNumber.REGULAR,
    style: FontStyle.ITALIC.toLowerCase()
  }
];

const CDN = "https://assets.guim.co.uk/";

const getStatic: (path: string) => string = path =>
  `${CDN}static/frontend/${path}`;

const fontFace: (fontFace: FontFace) => CSSObject = ({
  family,
  path,
  weight,
  style
}) => {
  const url = getStatic(path);
  return {
    fontFamily: family,
    fontWeights: weight,
    fontStyle: style,
    // generating a string which has the url of all the font formats
    src: formats.reduce(
      (p, c, i) => `${p}${i !== 0 ? "," : ""} url(${url}.${c}) format('${c}')`,
      ""
    )
  };
};

export const fontFaces: CSSObject[] = fonts.map(font => ({
  "@font-face": fontFace(font)
}));
