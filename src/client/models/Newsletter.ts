import { Newsletters } from '@/shared/model/Newsletter';
import { palette } from '@guardian/source-foundations';

const { brand, news, sport } = palette;

import {
	AFTERNOON_UPDATE_AU_IMAGE,
	DOWN_TO_EARTH_IMAGE,
	FIRST_EDITION_UK_IMAGE,
	FIRST_THING_US_IMAGE,
	FIVE_GREAT_READS_AU_IMAGE,
	HEADLINES_US_IMAGE,
	MORNING_MAIL_AU_IMAGE,
	SOCCER_US_IMAGE,
	TECHSCAPE_IMAGE,
	THE_CRUNCH_AU_IMAGE,
	THE_LONG_READ_IMAGE,
	THIS_IS_EUROPE_IMAGE,
} from '@/client/assets/newsletters';

export const NEWSLETTER_IMAGES: Record<string, string> = {
	[Newsletters.DOWN_TO_EARTH]: DOWN_TO_EARTH_IMAGE,
	[Newsletters.FIRST_EDITION_UK]: FIRST_EDITION_UK_IMAGE,
	[Newsletters.THE_LONG_READ]: THE_LONG_READ_IMAGE,
	[Newsletters.HEADLINES_US]: HEADLINES_US_IMAGE,
	[Newsletters.FIRST_THING_US]: FIRST_THING_US_IMAGE,
	[Newsletters.SOCCER_US]: SOCCER_US_IMAGE,
	[Newsletters.MORNING_MAIL_AU]: MORNING_MAIL_AU_IMAGE,
	[Newsletters.AFTERNOON_UPDATE_AU]: AFTERNOON_UPDATE_AU_IMAGE,
	[Newsletters.FIVE_GREAT_READS_AU]: FIVE_GREAT_READS_AU_IMAGE,
	[Newsletters.THE_CRUNCH_AU]: THE_CRUNCH_AU_IMAGE,
	[Newsletters.TECHSCAPE]: TECHSCAPE_IMAGE,
	[Newsletters.THIS_IS_EUROPE]: THIS_IS_EUROPE_IMAGE,
};

export const NEWSLETTER_IMAGE_POSITIONS: Record<string, string> = {
	[Newsletters.FIRST_EDITION_UK]: 'bottom left',
	[Newsletters.DOWN_TO_EARTH]: 'bottom left',
	[Newsletters.FIRST_THING_US]: 'bottom left',
	[Newsletters.HEADLINES_US]: 'bottom left',
	[Newsletters.MORNING_MAIL_AU]: 'bottom left',
	[Newsletters.AFTERNOON_UPDATE_AU]: 'bottom left',
};

export const NEWSLETTER_COLOURS: Record<string, string> = {
	[Newsletters.DOWN_TO_EARTH]: news[400],
	[Newsletters.FIRST_EDITION_UK]: news[400],
	[Newsletters.THE_LONG_READ]: brand[400],
	[Newsletters.FIRST_THING_US]: news[400],
	[Newsletters.HEADLINES_US]: news[400],
	[Newsletters.SOCCER_US]: sport[400],
	[Newsletters.MORNING_MAIL_AU]: news[400],
	[Newsletters.AFTERNOON_UPDATE_AU]: news[400],
	[Newsletters.FIVE_GREAT_READS_AU]: brand[400],
	[Newsletters.THE_CRUNCH_AU]: news[400],
	[Newsletters.TECHSCAPE]: news[400],
	[Newsletters.THIS_IS_EUROPE]: news[400],
};
