import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import { GeoLocation } from '@/shared/model/Geolocation';
import { EmailType } from '@/shared/model/EmailType';
import { QueryParams } from '@/shared/model/QueryParams';
import { Participations } from '@guardian/ab-core';
import { ConsentPath, RoutePaths } from '@/shared/model/Routes';
import { UserAttributesResponse } from '@/shared/lib/members-data-api';
import { Stage } from '@/shared/model/Configuration';
import { AppName } from '@/shared/lib/appNameUtils';

export interface FieldError {
	field: string;
	message: string;
}
interface ABTesting {
	mvtId?: number;
	participations?: Participations;
	forcedTestVariants?: Participations;
}

interface GlobalMessage {
	error?: string;
	success?: string;
}

export type IsNativeApp = 'android' | 'ios' | undefined;

export interface PageData {
	// general page data
	returnUrl?: string;
	email?: string;
	signInPageUrl?: string;
	geolocation?: GeoLocation;
	fieldErrors?: Array<FieldError>;
	formError?: string;
	browserName?: string;
	isNativeApp?: IsNativeApp;
	accountManagementUrl?: string;
	appName?: AppName;

	// token
	token?: string;

	// email sent pages specific
	emailType?: EmailType;
	resendEmailAction?: RoutePaths;
	changeEmailPage?: RoutePaths;

	// onboarding specific
	newsletters?: NewsLetter[];
	consents?: Consent[];
	page?: ConsentPath;
	previousPage?: ConsentPath;

	// reset password token specific
	timeUntilTokenExpiry?: number;

	// jobs specific
	firstName?: string;
	secondName?: string;
	userBelongsToGRS?: boolean;

	// signed in as page specific
	continueLink?: string;
	signOutLink?: string;

	// subscription specific
	newsletterId?: string;

	// delete specific
	contentAccess?: UserAttributesResponse['contentAccess'];
	// okta idx api specific
	hasStateHandle?: boolean; // determines if the state handle is present in the encrypted state
}

export interface RecaptchaConfig {
	recaptchaSiteKey: string;
}

export interface SentryConfig {
	build?: string;
	stage?: Stage;
	dsn: string;
}

export interface ClientHosts {
	idapiBaseUrl: string;
	oauthBaseUrl: string;
}

export interface ClientState {
	queryParams: QueryParams;
	globalMessage?: GlobalMessage;
	pageData?: PageData;
	csrf?: CsrfState;
	abTesting?: ABTesting;
	clientHosts: ClientHosts;
	recaptchaConfig: RecaptchaConfig;
	sentryConfig: SentryConfig;
}

export type CsrfState = {
	token?: string;
	pageUrl?: string;
};
