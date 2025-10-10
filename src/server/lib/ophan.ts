import { OphanEvent, OphanInteraction } from '@/shared/model/ophan';
import { logger } from '@/server/lib/serverSideLogger';
import { z } from 'zod';
import {
	OphanAction,
	OphanComponent,
	OphanComponentEvent,
	OphanComponentType,
} from '@guardian/libs';
import serialize from 'serialize-javascript';
import { timeoutSignal } from './timeoutSignal';
import { removeEmptyKeysFromObjectAndConvertValuesToString } from '@/shared/lib/queryParams';

const ophanUrl = 'https://ophan.theguardian.com/img/2';

// Component event params is the decoded version of the componentEventParams query parameter
// defined in the TrackingQueryParams interface from src/shared/model/QueryParams.ts
const componentEventParamsSchema = z
	.object({
		componentType: z.string(),
		componentId: z.string(),
		abTestName: z.string().optional(),
		abTestVariant: z.string().optional(),
		viewId: z.string(),
		browserId: z.string().optional(),
		visitId: z.string().optional(),
	})
	.strict();

export type ComponentEventParams = z.infer<typeof componentEventParamsSchema>;

/**
 * OphanConfig is the configuration for an Ophan event,
 * for example the browser id (bwid), the consent UUID (consentUUID)
 * and the page view id (viewId)
 */
export interface OphanConfig {
	bwid?: string;
	viewId?: string;
	consentUUID?: string;
}

/**
 * Convert the componentEventParams query string to the
 * ComponentEventParams type using zod, return undefined if
 * unable to parse the query string
 */
export const parseComponentEventParams = async (
	componentEventParams: string,
): Promise<ComponentEventParams | undefined> => {
	try {
		const parsedQuery = Object.fromEntries(
			new URLSearchParams(componentEventParams.replaceAll('undefined', '')),
		);

		const componentEventParamsParsed =
			await componentEventParamsSchema.safeParseAsync(parsedQuery);

		if (componentEventParamsParsed.success) {
			return componentEventParamsParsed.data;
		}
	} catch (error) {
		logger.warn(`Ophan: Error parsing componentEventParams`, error);
	}

	logger.warn(`Ophan: Failed to parse componentEventParams`, undefined);
};

/**
 * In some cases in DCR and Frontend we send the component type
 * as a lowercase string with no spaces, so we need to convert them
 * to the correct case (SCREAMING_SNAKE_CASE)
 * otherwise we just return the component type as is
 */
export const getComponentType = (componentType: string) => {
	if (componentType === 'signingate') {
		return 'SIGN_IN_GATE';
	}
	if (componentType === 'identityauthentication') {
		return 'IDENTITY_AUTHENTICATION';
	}
	if (componentType === 'acquisitionsheader') {
		return 'ACQUISITIONS_HEADER';
	}
	if (componentType === 'acquisitionsengagementbanner') {
		return 'ACQUISITIONS_ENGAGEMENT_BANNER';
	}
	return componentType as OphanComponentType;
};

/**
 * Generate the OphanComponentEvent object for the given componentEventParams
 */
export const generateOphanComponentEvent = (
	componentEventParams: ComponentEventParams,
	action: OphanAction,
	value?: string,
): OphanComponentEvent => {
	const componentType: OphanComponentType = getComponentType(
		componentEventParams.componentType,
	);

	const component: OphanComponent = {
		componentType,
		id: componentEventParams.componentId,
	};

	// only include ab test object if both abTestName and abTestVariant are defined
	const abTest =
		componentEventParams.abTestName && componentEventParams.abTestVariant
			? {
					name: componentEventParams.abTestName,
					variant: componentEventParams.abTestVariant,
				}
			: undefined;

	return {
		component,
		action,
		abTest,
		value,
	};
};

/**
 * @name record
 * @description Record an event to Ophan
 *
 * @param event The event to send to ophan
 * @param config The ophan configuration for this event
 * @returns void - This is a fire and forget call so no need to wait for a response
 */
export const record = (event: OphanEvent, config: OphanConfig = {}) => {
	const { bwid, consentUUID, viewId } = config;

	if (bwid && viewId) {
		const query = new URLSearchParams(
			removeEmptyKeysFromObjectAndConvertValuesToString({
				viewId,
				...event,
			}),
		);

		const cookie = new URLSearchParams(
			removeEmptyKeysFromObjectAndConvertValuesToString({
				bwid,
				consentUUID,
			}),
		);

		fetch(`${ophanUrl}?${query.toString()}`, {
			method: 'GET',
			signal: timeoutSignal(250),
			headers: {
				Cookie: cookie.toString().replace('&', ';'),
			},
		}).catch((error) => {
			logger.warn(`Ophan: Failed to record Ophan event`, error);
		});
	} else {
		logger.warn(`Ophan: Missing bwid or viewId`, undefined);
	}
};

/**
 * @name sendOphanInteractionEventServer
 * @description Send an interaction event to Ophan from the server side
 *
 * @param interaction The interaction to send to ophan
 * @param config The ophan configuration for this event
 */
export const sendOphanInteractionEventServer = (
	interaction: OphanInteraction,
	config?: OphanConfig,
) => record(interaction, config);

/**
 * @name sendOphanComponentEventFromQueryParamsServer
 * @description Send a component event to Ophan from the server side using the componentEventParams query parameter passed in from the frontend
 *
 * @param componentEventParamsQuery The componentEventParams query parameter from the frontend
 * @param action The OphanAction to send to ophan
 * @param value The value of the component event to send to ophan
 * @param consentUUID The user consent UUID from the consentUUID cookie
 */
export const sendOphanComponentEventFromQueryParamsServer = async (
	componentEventParamsQuery: string,
	action: OphanAction,
	value?: string,
	consentUUID?: string,
) => {
	const componentEventParams = await parseComponentEventParams(
		componentEventParamsQuery,
	);

	if (componentEventParams) {
		const componentEvent = generateOphanComponentEvent(
			componentEventParams,
			action,
			value,
		);

		const config: OphanConfig = {
			bwid: componentEventParams.browserId,
			viewId: componentEventParams.viewId,
			consentUUID,
		};

		logger.info(
			`Ophan: Sending component event to Ophan: config ${serialize(
				config,
			)} componentEvent ${serialize(componentEvent)} `,
			undefined,
		);

		record({ componentEvent }, config);
	}
};
