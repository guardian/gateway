import { CSSObject, css, SerializedStyles } from "@emotion/core";

const fontFiles = [
  "fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Light.woff2",
  "fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-LightItalic.woff2",
  "fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Medium.woff2",
  "fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-MediumItalic.woff2",
  "fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Bold.woff2",
  "fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Regular.woff2",
  "fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-RegularItalic.woff2",
  "fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Bold.woff2",
  "fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Regular.woff2",
  "fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-RegularItalic.woff2",
  "fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Bold.woff2"
];

// GU_STAGE is set in cloudformation.yml, so will be undefined locally
// const stage =
//   typeof process.env.GU_STAGE === "string"
//     ? process.env.GU_STAGE.toUpperCase()
//     : process.env.GU_STAGE;
// const CDN = stage
//   ? `//assets${stage === "CODE" ? "-code" : ""}.guim.co.uk/`
//   : "/";

const CDN = "https://assets.guim.co.uk/";

const getStatic = (path: string): string => `${CDN}static/frontend/${path}`;

const fontFace = (url: string, family: string, weight?: number): CSSObject => ({
  fontFamily: family,
  fontWeights: weight,
  src: `url(${getStatic(url)})`
});

export const fontFaces: CSSObject = {
  "@font-face": fontFace(
    "fonts/guardian-titlepiece/noalts-not-hinted/GTGuardianTitlepiece-Bold.woff2",
    "GT Guardian Titlepiece"
    // 700
  )
};
