export interface FontFace {
	path: string;
	family: string;
	weight?: number;
	style?: string;
}

export enum FontWeightName {
	BOLD = 'Bold',
	MEDIUM = 'Medium',
	REGULAR = 'Regular',
	LIGHT = 'Light',
}

export enum FontWeightNumber {
	BOLD = 700,
	MEDIUM = 500,
	REGULAR = 400,
	LIGHT = 300,
}

export enum FontStyle {
	ITALIC = 'Italic',
}

export enum FontFamily {
	TITLEPIECE = 'GT Guardian Titlepiece',
	HEADLINE = 'GH Guardian Headline',
	EGYPTIAN = 'GuardianTextEgyptian',
	SANS = 'GuardianTextSans',
}

export enum FontFamilyPath {
	TITLEPIECE = 'fonts/guardian-titlepiece/noalts-not-hinted/GTGuardianTitlepiece',
	HEADLINE = 'fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline',
	EGYPTIAN = 'fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian',
	SANS = 'fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans',
}
