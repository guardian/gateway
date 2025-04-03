export interface FontFace {
	path: string;
	family: string;
	weight?: number;
	style?: string;
}

export const FontWeightName = {
	BOLD: 'Bold',
	MEDIUM: 'Medium',
	REGULAR: 'Regular',
	LIGHT: 'Light',
} as const;

export const FontWeightNumber = {
	BOLD: 700,
	MEDIUM: 500,
	REGULAR: 400,
	LIGHT: 300,
} as const;

export const FontStyle = {
	ITALIC: 'Italic',
} as const;

export const FontFamily = {
	TITLEPIECE: 'GT Guardian Titlepiece',
	HEADLINE: 'GH Guardian Headline',
	EGYPTIAN: 'GuardianTextEgyptian',
	SANS: 'GuardianTextSans',
} as const;

export const FontFamilyPath = {
	TITLEPIECE:
		'fonts/guardian-titlepiece/noalts-not-hinted/GTGuardianTitlepiece',
	HEADLINE: 'fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline',
	EGYPTIAN:
		'fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian',
	SANS: 'fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans',
} as const;
